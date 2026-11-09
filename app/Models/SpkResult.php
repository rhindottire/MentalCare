<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $assessment_id
 * @property float $saw_score
 * @property int $saw_rank
 * @property float $topsis_score
 * @property int $topsis_rank
 * @property string $urgency_level
 * @property string $recommendation
 * @property string $referral_status
 * @property-read Assessment|null $assessment
 * @property-read CounselingSession|null $counselingSession
 */
class SpkResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'saw_score',
        'saw_rank',
        'topsis_score',
        'topsis_rank',
        'urgency_level',
        'recommendation',
        'referral_status',
    ];

    protected function casts(): array
    {
        return [
            'saw_score' => 'float',
            'saw_rank' => 'integer',
            'topsis_score' => 'float',
            'topsis_rank' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Assessment, $this>
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * @return HasOne<CounselingSession, $this>
     */
    public function counselingSession(): HasOne
    {
        return $this->hasOne(CounselingSession::class);
    }
}
