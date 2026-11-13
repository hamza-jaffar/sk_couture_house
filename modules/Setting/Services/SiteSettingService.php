<?php

namespace Modules\Setting\Services;

use App\Helpers\FileHelper;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Modules\Setting\Models\SiteSetting;

class SiteSettingService
{
    private const string CACHE_KEY = 'platform-settings';

    /**
     * @return array{
     *     general: array<string, mixed>,
     *     contact: array<string, mixed>,
     *     social: array<string, mixed>,
     *     mail: array<string, mixed>,
     *     seo: array<string, mixed>,
     *     variants: list<array{id: string, name: string, values: list<string>}>
     * }
     */
    public function all(): array
    {
        $settings = $this->storedGroups();
        $defaults = $this->defaults();
        $result = [];

        foreach ($defaults as $group => $payload) {
            $result[$group] = $group === 'variants'
                ? ($settings[$group] ?? [])
                : array_replace($payload, $settings[$group] ?? []);

            if ($group !== 'variants') {
                foreach ($payload as $key => $default) {
                    if ($default !== null && $result[$group][$key] === null) {
                        $result[$group][$key] = $default;
                    }
                }
            }
        }

        $result['general']['logo_url'] = FileHelper::url(
            $result['general']['logo_path'],
            'public',
        );
        $result['general']['favicon_url'] = FileHelper::url(
            $result['general']['favicon_path'],
            'public',
        );
        $result['seo']['og_image_url'] = FileHelper::url(
            $result['seo']['og_image_path'] ?? null,
            'public',
        );
        $result['mail']['has_password'] = filled($result['mail']['password'] ?? null);
        unset($result['mail']['password']);

        return $result;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(string $group, array $data): void
    {
        if (! array_key_exists($group, $this->defaults())) {
            throw new InvalidArgumentException('Unsupported platform settings group.');
        }

        $savedPayload = DB::transaction(function () use ($group, $data): array {
            $setting = SiteSetting::query()
                ->where('group', $group)
                ->lockForUpdate()
                ->first();
            $existing = $setting?->payload ?? [];
            $payload = $this->payloadForGroup($group, $data, $existing);

            $setting ??= new SiteSetting(['group' => $group]);
            $setting->payload = $payload;
            $setting->save();

            DB::afterCommit(fn () => Cache::forget(self::CACHE_KEY));

            return $payload;
        });

        if ($group === 'mail') {
            $this->applyMailConfiguration($savedPayload);
        }
    }

    /**
     * @param  array<string, mixed>|null  $mailSettings
     */
    public function applyMailConfiguration(?array $mailSettings = null): void
    {
        $mail = $mailSettings
            ?? $this->storedGroups()['mail']
            ?? $this->defaults()['mail'];

        if (blank($mail['host'] ?? null) || blank($mail['from_address'] ?? null)) {
            return;
        }

        Config::set([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.transport' => 'smtp',
            'mail.mailers.smtp.url' => null,
            'mail.mailers.smtp.scheme' => ($mail['encryption'] ?? 'tls') === 'ssl'
                ? 'smtps'
                : 'smtp',
            'mail.mailers.smtp.auto_tls' => ($mail['encryption'] ?? 'tls') !== 'none',
            'mail.mailers.smtp.host' => $mail['host'],
            'mail.mailers.smtp.port' => (int) $mail['port'],
            'mail.mailers.smtp.username' => blank($mail['username'] ?? null)
                ? null
                : $mail['username'],
            'mail.mailers.smtp.password' => filled($mail['password'] ?? null)
                ? Crypt::decryptString($mail['password'])
                : null,
            'mail.from.address' => $mail['from_address'],
            'mail.from.name' => $mail['from_name'],
        ]);

        Mail::purge('smtp');
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $existing
     * @return array<string, mixed>
     */
    private function payloadForGroup(
        string $group,
        array $data,
        array $existing,
    ): array {
        if ($group === 'general') {
            $payload = array_replace(
                array_intersect_key($existing, array_flip(array_keys($this->defaults()['general']))),
                Arr::only($data, [
                    'name',
                    'tagline',
                    'description',
                    'website_url',
                    'timezone',
                    'currency',
                    'currency_icon',
                    'logo_path',
                    'favicon_path',
                ]),
            );

            foreach (['logo', 'favicon'] as $field) {
                $pathKey = $field.'_path';
                $payload[$pathKey] = array_key_exists($pathKey, $data)
                    ? $data[$pathKey]
                    : ($existing[$pathKey] ?? null);
            }

            return $payload;
        }

        if ($group === 'mail') {
            $payload = array_replace(
                array_intersect_key($existing, array_flip(array_keys($this->defaults()['mail']))),
                Arr::only($data, [
                    'host',
                    'port',
                    'encryption',
                    'username',
                    'from_address',
                    'from_name',
                ]),
            );
            $payload['port'] = (int) $payload['port'];

            if (($data['clear_password'] ?? false) === true) {
                $payload['password'] = null;
            } elseif (filled($data['password'] ?? null)) {
                $payload['password'] = Crypt::encryptString($data['password']);
            } else {
                $payload['password'] = $existing['password'] ?? null;
            }

            return $payload;
        }

        if ($group === 'variants') {
            return array_values(array_map(
                fn (array $variant): array => [
                    'id' => filled($variant['id'] ?? null)
                        ? $variant['id']
                        : (string) Str::uuid(),
                    'name' => trim($variant['name']),
                    'values' => array_values(array_unique(array_map(
                        fn (string $value): string => trim($value),
                        $variant['values'],
                    ))),
                ],
                $data['variants'],
            ));
        }

        if ($group === 'seo') {
            $payload = array_replace(
                array_intersect_key($existing, array_flip(array_keys($this->defaults()['seo']))),
                Arr::only($data, [
                    'meta_title_template',
                    'meta_description',
                    'og_title',
                    'og_description',
                    'canonical_url',
                    'robots',
                    'google_analytics_id',
                    'og_image_path',
                ]),
            );

            $payload['og_image_path'] = array_key_exists('og_image_path', $data)
                ? $data['og_image_path']
                : ($existing['og_image_path'] ?? null);

            return $payload;
        }

        return Arr::only($data, array_keys($this->defaults()[$group]));
    }

    /**
     * @return array<string, array<string, mixed>|list<array{id: string, name: string, values: list<string>}>>
     */
    private function storedGroups(): array
    {
        return Cache::remember(
            self::CACHE_KEY,
            now()->addMinutes(30),
            fn (): array => SiteSetting::query()
                ->get(['group', 'payload'])
                ->mapWithKeys(fn (SiteSetting $setting): array => [
                    $setting->group => $setting->payload ?? [],
                ])
                ->all(),
        );
    }

    /**
     * @return array{
     *     general: array{name: string, tagline: string, description: string, website_url: string, timezone: string, currency: string, currency_icon: string, logo_path: string|null, favicon_path: string|null},
     *     contact: array{email: string, phone: string, alternate_phone: string, address: string, address_line_2: string, city: string, region: string, postal_code: string, country: string, business_hours: string},
     *     social: array{facebook: string, instagram: string, tiktok: string, youtube: string, pinterest: string, linkedin: string, x: string},
     *     mail: array{host: string, port: int, encryption: string, username: string, password: string|null, from_address: string, from_name: string},
     *     variants: list<array{id: string, name: string, values: list<string>}>
     * }
     */
    private function defaults(): array
    {
        return [
            'general' => [
                'name' => config('app.name', 'Store'),
                'tagline' => '',
                'description' => '',
                'website_url' => '',
                'timezone' => config('app.timezone', 'UTC'),
                'currency' => 'USD',
                'currency_icon' => '$',
                'logo_path' => null,
                'favicon_path' => null,
            ],
            'contact' => [
                'email' => '',
                'phone' => '',
                'alternate_phone' => '',
                'address' => '',
                'address_line_2' => '',
                'city' => '',
                'region' => '',
                'postal_code' => '',
                'country' => '',
                'business_hours' => '',
            ],
            'social' => [
                'facebook' => '',
                'instagram' => '',
                'tiktok' => '',
                'youtube' => '',
                'pinterest' => '',
                'linkedin' => '',
                'x' => '',
            ],
            'mail' => [
                'host' => '',
                'port' => 587,
                'encryption' => 'tls',
                'username' => '',
                'password' => null,
                'from_address' => '',
                'from_name' => '',
            ],
            'seo' => [
                'meta_title_template' => '%s | %store_name%',
                'meta_description' => '',
                'og_title' => '',
                'og_description' => '',
                'og_image_path' => null,
                'canonical_url' => '',
                'robots' => 'index, follow',
                'google_analytics_id' => '',
            ],
            'variants' => [],
        ];
    }
}
