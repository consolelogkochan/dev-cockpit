<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Resources\ProjectResource;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class ProjectController extends Controller
{
    // プロジェクト一覧を取得する
    public function index(Request $request)
    {
        $query = Project::latest();

        // 検索キーワードがあれば絞り込む
        if ($request->has('search')) {
            $value = $request->get('search');
            $query->where(function (Builder $q) use ($value) {
                $q->where('title', 'like', "%{$value}%")
                  ->orWhere('description', 'like', "%{$value}%");
            });
        }

        // 1ページあたり9件取得 (3列×3行で表示がいいため)
        // paginate() を使うと、自動的に meta (ページ数情報) が付与されます
        $projects = $query->paginate(9);

        return ProjectResource::collection($projects);
    }
}