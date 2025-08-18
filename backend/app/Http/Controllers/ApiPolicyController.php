<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ApiPolicyController extends Controller
{
    public function getPolicy(Request $request)
    {
        $token = ApiAuthController::getToken();
        $data = $request->all();

        $letters = strtoupper(Str::random(4));
        $numbers = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $data['payment']['documentNumber'] = 'DOC-' . $letters . $numbers;

        $userEmail = $data['additionalData']['userEmail'] ?? null;

        $response = Http::withoutVerifying()->withHeaders([
            'Token' => $token,
        ])->post(config('services.lifeishard.api_url') . 'policy', $data);

        $policyId = $response->json()['data']['policies'][0]['policyId'];

        $response = Http::withoutVerifying()->withHeaders([
            'Token' => $token,
        ])->get(config('services.lifeishard.api_url') . "policy/{$policyId}");

        $responseData = $response->json();
        $pdfFiles = $responseData['data']['files'] ?? [];

        if (!empty($pdfFiles) && $userEmail && filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            if (isset($pdfFiles[0]['content'])) {
                try {
                    Log::info('Attempting to send policy PDF email to: ' . $userEmail);

                    Mail::raw('Your insurance policy PDF is attached.', function ($message) use ($userEmail, $pdfFiles) {
                        $message->to($userEmail)
                            ->subject('Insurance Policy PDF')
                            ->attachData(
                                base64_decode($pdfFiles[0]['content']),
                                'insurance-policy.pdf',
                                ['mime' => 'application/pdf']
                            );
                    });

                    Log::info('Policy email sent successfully to: ' . $userEmail);
                } catch (\Exception $e) {
                    Log::error('Policy email sending failed: ' . $e->getMessage());
                }
            } else {
                Log::error('Cannot send policy email - missing PDF content');
            }
        } else {
            if (empty($pdfFiles)) {
                Log::warning('No PDF files available to send');
            } else if (!$userEmail) {
                Log::warning('No email provided - skipping email sending');
            } else {
                Log::warning('Invalid email format: ' . $userEmail);
            }
        }

        return response()->json([
            'status' => $response->status(),
            'body' => $pdfFiles
        ]);
    }
}
