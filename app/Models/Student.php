<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property string $nim
 * @property string $name
 * @property string $study_program
 * @property string $faculty
 * @property int $semester
 * @property string|null $email
 * @property string|null $phone
 */
class Student extends Model
{
    use HasFactory;

    protected $primaryKey = 'nim';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'nim',
        'name',
        'study_program',
        'faculty',
        'semester',
        'email',
        'phone',
    ];

    /**
     * @return HasMany<Assessment, $this>
     */
    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class, 'student_nim', 'nim');
    }

    /**
     * @return HasOne<Assessment, $this>
     */
    public function latestAssessment(): HasOne
    {
        return $this->hasOne(Assessment::class, 'student_nim', 'nim')->latestOfMany();
    }
}
