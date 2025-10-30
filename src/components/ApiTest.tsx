"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { useState } from "react";

interface ApiEndpoint {
  path: string;
  name: string;
  description: string;
}

const apiEndpoints: ApiEndpoint[] = [
  { path: "/api/hello", name: "Hello API", description: "平台信息接口" },
  { path: "/api/env", name: "Env API", description: "环境变量接口" },
  { path: "/api/health", name: "Health Check", description: "健康检查接口" },
];

export function ApiTest() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const testApi = async (endpoint: ApiEndpoint) => {
    setLoading(endpoint.path);
    setResponse(null);
    try {
      const res = await fetch(endpoint.path);
      const data = await res.json();
      setResponse({
        endpoint: endpoint.path,
        data,
        status: res.status,
        success: true,
      });
    } catch (error: any) {
      setResponse({
        endpoint: endpoint.path,
        error: error.message,
        status: "error",
        success: false,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {apiEndpoints.map((endpoint) => (
          <Card
            key={endpoint.path}
            className="relative overflow-hidden group hover:shadow-lg transition-all hover-lift"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 space-y-3 relative">
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {endpoint.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {endpoint.description}
                </p>
                <code className="text-xs text-muted-foreground font-mono mt-1 block">
                  {endpoint.path}
                </code>
              </div>
              <Button
                onClick={() => testApi(endpoint)}
                disabled={loading !== null}
                size="sm"
                variant="outline"
                className="w-full gap-2"
              >
                {loading === endpoint.path ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    请求中...
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    测试
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Response Display */}
      {response && (
        <Card className="animate-fade-in overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {response.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-sm">
                  响应结果{" "}
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {response.endpoint}
                  </code>
                </h3>
                {response.status && (
                  <p className="text-xs text-muted-foreground mt-1">
                    状态码: {response.status}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-muted/50 rounded-md p-4 overflow-auto max-h-[400px]">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(response.data || response, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
