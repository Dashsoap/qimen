#!/bin/bash

echo "🧪 测试奇门遁甲AI后端API"
echo "================================"

# 测试健康检查
echo "1. 测试健康检查..."
curl -s http://localhost:3001/health | head -20

echo -e "\n\n2. 测试AI分析API..."

# 测试AI分析
curl -X POST http://localhost:3001/api/analysis/qimen \
  -H "Content-Type: application/json" \
  -d '{
    "question": "我的事业运势如何？",
    "paipanData": {
      "宫1": { "八门": "开门", "九星": "天心星", "八神": "值符" },
      "宫2": { "八门": "休门", "九星": "天蓬星", "八神": "螣蛇" }
    }
  }' | head -50

echo -e "\n\n✅ API测试完成！" 