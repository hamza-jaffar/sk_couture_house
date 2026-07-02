<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FabricCanvas extends Model
{
    protected $fillable = [
        'name', 'desc', 'origin_mill', 'density_weight',
        'structure', 'formulation', 'rigidity', 'breathability',
        'warmth', 'luster'
    ];
}
