# 部署说明

## 生产环境API代理配置

### 问题背景
聚合数据API (https://v.juhe.cn/toutiao/index) 存在CORS跨域限制，无法直接在浏览器中调用。

### 环境信息
- **生产环境URL**: https://web-tools-davon.netlify.app/
- **聚合接口URL**: https://v.juhe.cn/toutiao/index (使用HTTPS协议)

### 解决方案

#### 开发环境
- 使用 Vite 代理配置 (`vite.config.js`)
- 代理路径：`/api/proxy/juhe` → `https://v.juhe.cn`

#### 生产环境 (Netlify)
- 使用 Netlify 重定向规则 (`_redirects`)
- 重定向规则：`/api/proxy/juhe/* https://v.juhe.cn/:splat 200`

### 配置文件说明

#### `_redirects`
```
# 聚合数据API代理 - 解决生产环境CORS问题
/api/proxy/juhe/* https://v.juhe.cn/:splat 200

# 默认路由重定向
/* /index.html 200
```

#### `src/api/index.js`
```javascript
// 根据环境动态选择API基础URL
get PROXY_BASE_URL() {
  // 开发环境使用vite代理，生产环境使用Netlify重定向
  return import.meta.env.DEV ? '/api/proxy/juhe' : '/api/proxy/juhe'
}
```

### 部署步骤

1. 确保 `_redirects` 文件包含正确的代理规则
2. 部署到 Netlify
3. Netlify 会自动应用重定向规则
4. API 请求会通过 Netlify 代理转发到聚合数据服务器

### 测试验证

- 开发环境：`npm run dev` 后访问 http://localhost:5173
- 生产环境：部署后访问 Netlify 提供的域名
- 检查新闻模块是否能正常加载数据

### 环境变量配置

#### 生产环境 Netlify 配置
在 Netlify 部署设置中添加环境变量：
```
juhe_key=your_actual_juhe_api_key
```

#### 本地开发环境
- 开发环境会自动使用代码中的默认API Key
- 如需使用自定义Key，可在 `.env.development` 中添加：
```
juhe_key=your_development_juhe_api_key
```

### 注意事项

1. **API Key 安全性**：生产环境API Key通过环境变量管理，避免硬编码
2. **调用频率限制**：聚合数据API有调用频率限制
3. **缓存机制**：应用已实现缓存机制和错误回退
4. **自动回退**：当API不可用时会自动使用本地缓存或模拟数据
5. **跨域解决**：生产环境的重定向规则确保了跨域问题的解决