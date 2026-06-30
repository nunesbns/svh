<?php

namespace App\Filament\Resources;

use App\Models\HistorySnapshot;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

use App\Infolists\Components\DiffEntry;
use Filament\Infolists\Infolist;
use Filament\Infolists;

class SnapshotResource extends Resource
{
    protected static ?string $model = HistorySnapshot::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Context Info')
                    ->schema([
                        Infolists\Components\TextEntry::make('project.name'),
                        Infolists\Components\TextEntry::make('application.display_name'),
                        Infolists\Components\TextEntry::make('scope'),
                        Infolists\Components\TextEntry::make('user_sc_login'),
                        Infolists\Components\TextEntry::make('captured_at')->dateTime(),
                    ])->columns(3),
                Infolists\Components\Section::make('Code Changes')
                    ->schema([
                        DiffEntry::make('content_blob')
                            ->columnSpanFull()
                            ->label(''),
                    ]),
            ]);
    }

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
            ->defaultSort('captured_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('project_id')
                    ->relationship('project', 'name')
                    ->label('Projeto'),
                Tables\Filters\SelectFilter::make('application_id')
                    ->relationship('application', 'cod_apl')
                    ->label('Aplicação'),
                Tables\Filters\SelectFilter::make('type')
                    ->options(fn () => \App\Models\HistorySnapshot::query()->distinct()->pluck('type', 'type')->toArray())
                    ->label('Tipo'),
                Tables\Filters\SelectFilter::make('user_sc_login')
                    ->options(fn () => \App\Models\HistorySnapshot::query()->whereNotNull('user_sc_login')->distinct()->pluck('user_sc_login', 'user_sc_login')->toArray())
                    ->label('Usuário'),
                Tables\Filters\Filter::make('captured_at')
                    ->form([
                        Forms\Components\DatePicker::make('captured_from')->label('Data Inicial'),
                        Forms\Components\DatePicker::make('captured_until')->label('Data Final'),
                    ])
                    ->query(function (\Illuminate\Database\Eloquent\Builder $query, array $data): \Illuminate\Database\Eloquent\Builder {
                        return $query
                            ->when(
                                $data['captured_from'],
                                fn (\Illuminate\Database\Eloquent\Builder $query, $date): \Illuminate\Database\Eloquent\Builder => $query->whereDate('captured_at', '>=', $date),
                            )
                            ->when(
                                $data['captured_until'],
                                fn (\Illuminate\Database\Eloquent\Builder $query, $date): \Illuminate\Database\Eloquent\Builder => $query->whereDate('captured_at', '<=', $date),
                            );
                    })
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
