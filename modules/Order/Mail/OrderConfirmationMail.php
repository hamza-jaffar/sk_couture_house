<?php

namespace Modules\Order\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Modules\Order\Models\Order;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Confirmed - '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $itemsHtml = '';
        foreach ($this->order->items as $item) {
            $options = '';
            if (! empty($item->selected_options)) {
                $opts = [];
                foreach ($item->selected_options as $k => $v) {
                    $opts[] = htmlspecialchars($k).': '.htmlspecialchars((string) $v);
                }
                $options = '<div style="font-size:12px;color:#737373;">'.implode(' | ', $opts).'</div>';
            }

            $itemsHtml .= '
            <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#171717;">
                    <div style="font-weight:600;">'.htmlspecialchars($item->product_title).'</div>
                    '.$options.'
                    <div style="font-size:12px;color:#737373;">Qty: '.$item->quantity.' &times; '.$this->order->currency_icon.number_format((float) $item->unit_price, 2).'</div>
                </td>
                <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:600;text-align:right;color:#171717;">
                    '.$this->order->currency_icon.number_format((float) $item->total_price, 2).'
                </td>
            </tr>';
        }

        $address = $this->order->shipping_address ?? [];
        $shippingText = htmlspecialchars($address['line1'] ?? '').', '
            .htmlspecialchars($address['city'] ?? '').', '
            .htmlspecialchars($address['country'] ?? '');

        return '
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:24px;background:#f5f5f5;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;padding:32px;">
                <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #171717;">
                    <h1 style="font-size:22px;letter-spacing:4px;text-transform:uppercase;margin:0;color:#171717;">SK COUTURE HOUSE</h1>
                    <p style="font-size:12px;color:#737373;margin-top:6px;text-transform:uppercase;letter-spacing:1px;">Order Confirmation</p>
                </div>

                <div style="padding:24px 0 16px;">
                    <p style="font-size:14px;color:#171717;margin:0 0 8px;">Dear '.htmlspecialchars($this->order->customer_name).',</p>
                    <p style="font-size:14px;color:#525252;line-height:1.6;margin:0;">
                        Thank you for your order. We have received your order <strong>#'.htmlspecialchars($this->order->order_number).'</strong> and our atelier has begun processing it.
                    </p>
                </div>

                <div style="margin:20px 0;padding:16px;background:#fafafa;border:1px solid #e5e5e5;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#737373;margin-bottom:6px;">Delivery Details</div>
                    <div style="font-size:13px;color:#171717;line-height:1.5;">
                        <strong>'.htmlspecialchars($this->order->customer_name).'</strong><br>
                        '.$shippingText.'<br>
                        Phone: '.htmlspecialchars($this->order->customer_phone ?? 'N/A').'
                    </div>
                </div>

                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                    <thead>
                        <tr>
                            <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#737373;padding-bottom:8px;border-bottom:1px solid #171717;">Item</th>
                            <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#737373;padding-bottom:8px;border-bottom:1px solid #171717;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        '.$itemsHtml.'
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="padding:16px 0 4px;font-size:13px;color:#525252;">Subtotal</td>
                            <td style="padding:16px 0 4px;font-size:13px;text-align:right;color:#171717;">'.$this->order->currency_icon.number_format((float) $this->order->subtotal, 2).'</td>
                        </tr>
                        <tr>
                            <td style="padding:4px 0 16px;font-size:13px;color:#525252;">Shipping</td>
                            <td style="padding:4px 0 16px;font-size:13px;text-align:right;color:#16a34a;">Free</td>
                        </tr>
                        <tr>
                            <td style="padding:12px 0;font-size:16px;font-weight:700;color:#171717;border-top:2px solid #171717;">Grand Total</td>
                            <td style="padding:12px 0;font-size:16px;font-weight:700;text-align:right;color:#171717;border-top:2px solid #171717;">'.$this->order->currency_icon.number_format((float) $this->order->total, 2).'</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e5e5e5;text-align:center;font-size:12px;color:#737373;">
                    <p style="margin:0 0 6px;">Payment Method: <strong>'.strtoupper(str_replace('_', ' ', $this->order->payment_method ?? 'Cash on Delivery')).'</strong></p>
                    <p style="margin:0;">If you have any questions, reply directly to this email or contact our atelier.</p>
                </div>
            </div>
        </body>
        </html>';
    }
}
