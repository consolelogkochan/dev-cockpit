<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ログインしていない、または管理者でない場合は 403 (Forbidden) を返す
        if (! $request->user() || ! $request->user()->is_admin) {
            return response()->json(['message' => '管理者権限が必要です。'], 403);
        }

        return $next($request);
    }
}
