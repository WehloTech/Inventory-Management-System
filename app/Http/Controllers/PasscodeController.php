<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PasscodeController extends Controller
{
    // ── Helper to get a setting value ──
    private function getSetting(string $key): ?string
    {
        $row = DB::table('settings')->where('key', $key)->first();
        return $row?->value;
    }

    // ── Verify passcode ──
    public function verify(Request $request)
    {
        $request->validate(['passcode' => 'required|string']);

        $hashed = $this->getSetting('admin_passcode');

        if (!$hashed || !Hash::check($request->passcode, $hashed)) {
            return response()->json(['message' => 'Incorrect passcode'], 403);
        }

        return response()->json(['message' => 'OK']);
    }

    // ── Step 1: Send OTP to admin email ──
    public function sendResetCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $adminEmail = $this->getSetting('admin_email');

        if ($request->email !== $adminEmail) {
            return response()->json(['message' => 'Email does not match admin email.'], 403);
        }

        $otp = rand(100000, 999999);
        Cache::put('passcode_reset_otp', $otp, now()->addMinutes(10));

        Mail::raw(
            "Your passcode reset code is: {$otp}\n\nThis code expires in 10 minutes.",
            function ($message) use ($adminEmail) {
                $message->to($adminEmail)->subject('Passcode Reset Code');
            }
        );

        return response()->json(['message' => 'Reset code sent to admin email.']);
    }

    // ── Step 2: Verify OTP ──
    public function verifyOtp(Request $request)
    {
        $request->validate(['otp' => 'required|string']);

        $cached = Cache::get('passcode_reset_otp');

        if (!$cached || (string)$cached !== $request->otp) {
            return response()->json(['message' => 'Invalid or expired code.'], 403);
        }

        return response()->json(['message' => 'OTP verified.']);
    }

    // ── Step 3: Reset passcode ──
    public function resetPasscode(Request $request)
    {
        $request->validate([
            'otp'         => 'required|string',
            'newPasscode' => 'required|string|min:4',
        ]);

        $cached = Cache::get('passcode_reset_otp');

        if (!$cached || (string)$cached !== $request->otp) {
            return response()->json(['message' => 'Invalid or expired code.'], 403);
        }

        // Save hashed passcode to DB
        DB::table('settings')
            ->where('key', 'admin_passcode')
            ->update([
                'value'      => Hash::make($request->newPasscode),
                'updated_at' => now(),
            ]);

        Cache::forget('passcode_reset_otp');

        return response()->json(['message' => 'Passcode updated successfully.']);
    }
}