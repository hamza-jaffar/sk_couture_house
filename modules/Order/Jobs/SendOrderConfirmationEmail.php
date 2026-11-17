<?php

namespace Modules\Order\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Modules\Order\Mail\OrderConfirmationMail;
use Modules\Order\Models\Order;
use Modules\Setting\Services\SiteSettingService;
use Throwable;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public readonly Order $order,
    ) {}

    public function handle(SiteSettingService $settings): void
    {
        if (blank($this->order->customer_email)) {
            return;
        }

        try {
            $settings->applyMailConfiguration();

            Mail::to($this->order->customer_email)
                ->send(new OrderConfirmationMail($this->order));

            Log::info("Order confirmation email sent successfully for order: {$this->order->order_number}");
        } catch (Throwable $e) {
            Log::error("Failed to send order confirmation email for order {$this->order->order_number}: {$e->getMessage()}", [
                'order_id' => $this->order->id,
                'email' => $this->order->customer_email,
                'exception' => $e,
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::critical("Order confirmation email job failed permanently for order {$this->order->order_number}: {$exception->getMessage()}", [
            'order_id' => $this->order->id,
            'customer_email' => $this->order->customer_email,
        ]);
    }
}
