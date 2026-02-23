<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('settings')->upsert(
            [
                [
                    'key'        => 'admin_passcode',
                    'value'      => Hash::make('5678'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'key'        => 'admin_email',
                    'value'      => 'ronnaogadaza@gmail.com',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ],
            ['key'],           // unique key to match on
            ['value', 'updated_at']  // columns to update if exists
        );
    }
}