import { allCountries } from 'country-region-data';
import { useMemo, useState } from 'react';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import SearchableSelect, {
    type SearchableOption,
} from '@/components/settings/searchable-select';

const countries: SearchableOption[] = allCountries
    .map(([name]) => ({ value: name, label: name }))
    .sort((first, second) => first.label.localeCompare(second.label));

type Props = {
    country: string;
    region: string;
    city: string;
    postalCode: string;
    errors: Record<string, string | undefined>;
    onCountryChange: (value: string) => void;
    onRegionChange: (value: string) => void;
    onCityChange: (value: string) => void;
};

export default function LocationFields({
    country,
    region,
    city,
    postalCode,
    errors,
    onCountryChange,
    onRegionChange,
    onCityChange,
}: Props) {
    const [cityNames, setCityNames] = useState<string[]>([]);
    const [cityQuery, setCityQuery] = useState('');
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [cityLoadError, setCityLoadError] = useState(false);
    const selectedCountry = allCountries.find(
        ([name]) => name.toLowerCase() === country.toLowerCase(),
    );
    const regions = selectedCountry?.[2] ?? [];
    const regionOptions = useMemo(
        () =>
            regions
                .map(([name]) => ({ value: name, label: name }))
                .sort((first, second) =>
                    first.label.localeCompare(second.label),
                ),
        [regions],
    );
    const cityOptions = useMemo(() => {
        const searchTerm = cityQuery.trim().toLowerCase();

        if (searchTerm.length < 2) {
            return [];
        }

        return cityNames
            .filter((name) => name.toLowerCase().includes(searchTerm))
            .slice(0, 50)
            .map((name) => ({ value: name, label: name }));
    }, [cityNames, cityQuery]);

    async function loadCityNames(): Promise<void> {
        if (cityNames.length > 0 || isLoadingCities) {
            return;
        }

        setIsLoadingCities(true);

        try {
            const { default: cities } = await import('cities-list');
            setCityNames(Object.keys(cities));
            setCityLoadError(false);
        } catch {
            setCityLoadError(true);
        } finally {
            setIsLoadingCities(false);
        }
    }

    function selectCountry(countryName: string) {
        const countryData = allCountries.find(
            ([name]) => name.toLowerCase() === countryName.toLowerCase(),
        );

        onCountryChange(countryData?.[0] ?? countryName);
        onRegionChange('');
        onCityChange('');
    }

    function selectCustomCountry(countryName: string) {
        const countryData = allCountries.find(
            ([name]) => name.toLowerCase() === countryName.toLowerCase(),
        );

        if (countryData) {
            selectCountry(countryData[0]);
            return;
        }

        onCountryChange(countryName);
        onRegionChange('');
        onCityChange('');
    }

    const selectedCountryOption = allCountries.find(
        ([name]) => name.toLowerCase() === country.toLowerCase(),
    );
    const countryOptionsWithCurrent = useMemo(() => {
        if (
            !country ||
            allCountries.some(
                ([name]) => name.toLowerCase() === country.toLowerCase(),
            )
        ) {
            return countries;
        }

        return [...countries, { value: country, label: country }];
    }, [country]);

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <SearchableSelect
                    id="contact-country"
                    name="country"
                    label="Country"
                    value={selectedCountryOption?.[0] ?? country}
                    options={countryOptionsWithCurrent}
                    placeholder="Select or add a country"
                    error={errors.country}
                    onChange={selectCustomCountry}
                />
                <SearchableSelect
                    id="contact-region"
                    name="region"
                    label="State / region"
                    value={region}
                    options={regionOptions}
                    placeholder={
                        country
                            ? 'Select or add a state / region'
                            : 'Select a country first'
                    }
                    emptyMessage="No matching state. Choose the custom value to add it."
                    error={errors.region}
                    onChange={onRegionChange}
                />
                <div className="grid gap-2">
                    <SearchableSelect
                        id="contact-city"
                        name="city"
                        label="City"
                        value={city}
                        options={cityOptions}
                        placeholder="Search or add a city"
                        searchPlaceholder="Type at least 2 letters..."
                        emptyMessage={
                            isLoadingCities
                                ? 'Loading city names...'
                                : 'No matching city. Choose the custom value to add it.'
                        }
                        error={errors.city}
                        onChange={onCityChange}
                        onSearchChange={setCityQuery}
                        onOpenChange={(open) => {
                            if (open) {
                                void loadCityNames();
                            }
                        }}
                    />
                    {cityLoadError ? (
                        <p
                            role="status"
                            className="text-xs text-muted-foreground"
                        >
                            City suggestions could not be loaded. You can still
                            enter a custom city.
                        </p>
                    ) : null}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="contact-postal-code">Postal code</Label>
                    <input
                        id="contact-postal-code"
                        name="postal_code"
                        defaultValue={postalCode}
                        aria-invalid={Boolean(errors.postal_code)}
                        aria-describedby={
                            errors.postal_code
                                ? 'contact-postal-code-error'
                                : undefined
                        }
                        className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    />
                    {errors.postal_code ? (
                        <InputError
                            id="contact-postal-code-error"
                            message={errors.postal_code}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
}
