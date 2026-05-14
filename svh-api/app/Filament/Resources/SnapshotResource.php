<?php

namespace App\Filament\Resources;

use App\Models\HistorySnapshot;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SnapshotResource extends Resource
{
    protected static ?string $model = HistorySnapshot::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('scope')->disabled(),
                Forms\Components\TextInput::make('user_sc_login')->disabled(),
                Forms\Components\Textarea::make('content_blob')->disabled()->rows(10),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('project.cod_prj'),
                Tables\Columns\TextColumn::make('application.cod_apl'),
                Tables\Columns\TextColumn::make('scope'),
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\TextColumn::make('user_sc_login'),
                Tables\Columns\TextColumn::make('captured_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('project_id')
                    ->relationship('project', 'name'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => \App\Filament\Resources\SnapshotResource\Pages\ListSnapshots::route('/'),
            'view' => \App\Filament\Resources\SnapshotResource\Pages\ViewSnapshot::route('/{record}'),
        ];
    }
}
