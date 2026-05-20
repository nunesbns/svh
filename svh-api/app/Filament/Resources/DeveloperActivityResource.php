<?php

namespace App\Filament\Resources;

use App\Models\ApiKey;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Redis;

class DeveloperActivityResource extends Resource
{
    protected static ?string $model = ApiKey::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $label = 'Developer Activity';

    protected static function getRecordPresence($record): ?array
    {
        if (! $record->scriptcase_username) {
            return null;
        }

        return once(function () use ($record) {
            $presenceJson = Redis::get("presence:active_user:{$record->scriptcase_username}");
            return $presenceJson ? json_decode($presenceJson, true) : null;
        });
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('scriptcase_username')->searchable(),
                Tables\Columns\TextColumn::make('email'),
                Tables\Columns\TextColumn::make('last_used_at')->dateTime()->sortable(),
                Tables\Columns\IconColumn::make('status')
                    ->label('Online')
                    ->boolean()
                    ->getStateUsing(fn ($record) => $record->last_used_at && $record->last_used_at->diffInMinutes(now()) < 5),
                Tables\Columns\TextColumn::make('cod_prj')
                    ->label('Project')
                    ->getStateUsing(function ($record) {
                        $presence = static::getRecordPresence($record);
                        return $presence['cod_prj'] ?? '-';
                    }),
                Tables\Columns\TextColumn::make('cod_apl')
                    ->label('Application')
                    ->getStateUsing(function ($record) {
                        $presence = static::getRecordPresence($record);
                        return $presence['cod_apl'] ?? '-';
                    }),
            ])
            ->filters([])
            ->actions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => \App\Filament\Resources\DeveloperActivityResource\Pages\ListDeveloperActivity::route('/'),
        ];
    }
}
