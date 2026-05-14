<?php

namespace App\Filament\Resources;

use App\Models\ApiKey;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DeveloperActivityResource extends Resource
{
    protected static ?string $model = ApiKey::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $label = 'Developer Activity';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('email'),
                Tables\Columns\TextColumn::make('last_used_at')->dateTime()->sortable(),
                Tables\Columns\IconColumn::make('status')
                    ->label('Online')
                    ->boolean()
                    ->getStateUsing(fn ($record) => $record->last_used_at && $record->last_used_at->diffInMinutes(now()) < 5),
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
