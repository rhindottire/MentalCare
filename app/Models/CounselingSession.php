<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $spk_result_id
 * @property int|null $counselor_id
 * @property Carbon|string|null $scheduled_at
 * @property string $status
 * @property string|null $clinical_notes
 * @property-read SpkResult|null $spkResult
 * @property-read Counselor|null $counselor
 */
class CounselingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'spk_result_id',
        'counselor_id',
        'scheduled_at',
        'status',
        'clinical_notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<SpkResult, $this>
     */
    public function spkResult(): BelongsTo
    {
        return $this->belongsTo(SpkResult::class);
    }

    /**
     * @return BelongsTo<Counselor, $this>
     */
    public function counselor(): BelongsTo
    {
        return $this->belongsTo(Counselor::class);
    }
}
