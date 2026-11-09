<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $specialization
 * @property string $phone
 * @property bool $is_active
 */
class Counselor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'specialization',
        'phone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<CounselingSession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(CounselingSession::class);
    }
}
