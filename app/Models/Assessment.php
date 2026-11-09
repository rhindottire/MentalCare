<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $student_nim
 * @property Carbon|string $assessment_date
 * @property int $score_c1_depression
 * @property int $score_c2_anxiety
 * @property int $score_c3_stress
 * @property float $score_c4_gpa_drop
 * @property int $score_c5_sleep_disturbance
 * @property string|null $student_notes
 * @property-read Student|null $student
 * @property-read SpkResult|null $spkResult
 */
class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_nim',
        'assessment_date',
        'score_c1_depression',
        'score_c2_anxiety',
        'score_c3_stress',
        'score_c4_gpa_drop',
        'score_c5_sleep_disturbance',
        'student_notes',
    ];

    protected function casts(): array
    {
        return [
            'assessment_date' => 'date',
            'score_c1_depression' => 'integer',
            'score_c2_anxiety' => 'integer',
            'score_c3_stress' => 'integer',
            'score_c4_gpa_drop' => 'float',
            'score_c5_sleep_disturbance' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_nim', 'nim');
    }

    /**
     * @return HasOne<SpkResult, $this>
     */
    public function spkResult(): HasOne
    {
        return $this->hasOne(SpkResult::class);
    }
}
