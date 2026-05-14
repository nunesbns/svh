<?php

namespace App\Filament\Resources;

use App\Models\AuditLog;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AuditLogResource extends Resource
{
    protected static ?string $model = AuditLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-exclamation';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('action')->searchable(),
                Tables\Columns\TextColumn::make('actor')->searchable(),
                Tables\Columns\TextColumn::make('target'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([])
            ->actions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => \App\Filament\Resources\AuditLogResource\Pages\ListAuditLogs::route('/'),
        ];
    }
}
