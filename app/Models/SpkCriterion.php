<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpkCriterion extends Model
{
    use HasFactory;

    protected $table = 'spk_criteria';

    protected $primaryKey = 'code';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'code',
        'name',
        'weight',
        'type',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'float',
        ];
    }
}
