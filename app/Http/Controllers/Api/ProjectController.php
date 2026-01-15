<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Resources\ProjectResource;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // プロジェクト一覧を取得する
    public function index()
    {
        // 登録が新しい順に取得
        $projects = Project::latest()->get();

        // Resourceを使って整形して返す
        return ProjectResource::collection($projects);
    }
}