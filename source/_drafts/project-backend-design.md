---
title: project-backend-design
tags:
---

从 0 到 1，设计一个后端系统。
<!-- more -->

技术背景：nestjs + typeorm + mysql + redis + jwt

## 项目结构

### 基础结构

- src
  - app.controller.ts
  - app.module.ts
  - app.service.ts
  - main.ts

### 模块结构

- src
  - modules
    - auth
      - auth.controller.ts
      - auth.module.ts
      - auth.service.ts
    - user
      - user.controller.ts
      - user.module.ts
      - user.service.ts
    - post
      - post.controller.ts
      - post.module.ts
      - post.service.ts

### 控制器

- src
  - controllers
    - app.controller.ts
    - auth.controller.ts
    - user.controller.ts
    - post.controller.ts

### 服务

- src
  - services
    - app.service.ts
    - auth.service.ts
    - user.service.ts
    - post.service.ts

### 实体

- src
  - entities
    - user.entity.ts
    - post.entity.ts

### 路由

- src
  - routes
    - app.route.ts
    - auth.route.ts
    - user.route.ts
    - post.route.ts

### 配置

- src
  - config
    - database.config.ts

### 中间件

- src
  - middlewares
    - auth.middleware.ts

### 异常处理

- src
  - exceptions
    - http.exception.filter.ts

### 日志

- src
  - logs
    - logger.service.ts

### 验证

- src
  - validators
    - user.validator.ts
    - post.validator.ts

### 依赖注入

- src
  - providers
    - database.provider.ts

### 模块

- src
  - modules
    - app.module.ts
    - auth.module.ts
    - user.module.ts
    - post.module.ts

### 测试

- src
  - tests
    - auth.e2e-spec.ts
    - user.e2e-spec.ts
    - post.e2e-spec.ts

### 脚本

- src
  - scripts
    - seed.ts

### 静态文件

- src
  - public
    - index.html
    - styles.css
    - scripts.js

### 环境变量

- .env
- .env.production
- .env.development

### 入口文件

- src
  - main.ts

### 退出文件

- src
  - exit.ts

### 依赖

- package.json
- tsconfig.json
- tslint.json

### README.md

- 项目说明文档

### CHANGELOG.md

- 更新日志文档

### LICENSE

- 许可证文件

### .gitignore

- Git忽略文件

### .prettierrc

- Prettier配置文件

### .editorconfig

- 编辑器配置文件

### .nvmrc

- Node版本管理配置文件

### .dockerignore

- Docker忽略文件

### .dockerfile

- Docker镜像构建文件

### .travis.yml

- Travis CI配置文件

### .gitlab-ci.yml

- GitLab CI配置文件

### .circleci/config.yml

- CircleCI配置文件

### .github/workflows

- GitHub Actions配置文件

### .vscode

- VS Code配置文件

### .eslintrc.js

- ESLint配置文件

### .prettierignore

- Prettier忽略文件

### .prettier.config.js

- Prettier配置文件

### .stylelintrc.js

- Stylelint配置文件

### .stylelintignore

- Stylelint忽略文件

### .commitlintrc.js

- Commitlint配置文件

### .commitlintignore

- Commitlint忽略文件

### .huskyrc.js

- Husky配置文件

### .huskyrc

- Husky配置文件

### .lintstagedrc.js

- lint-staged配置文件

### .lintstagedrc

- lint-staged配置文件

### .commitizenrc

- Commitizen配置文件

### .cz-config.js

- Commitizen配置文件

### .cz-config.json

- Commitizen配置文件

### .cz-config.yaml

- Commitizen配置文件

### .cz-config.yml

- Commitizen配置文件

### .cz-config.ts

- Commitizen配置文件

### .cz-config.js

- Commitizen配置文件

### .cz-config.json

- Commitizen配置文件

### .cz-config.yaml

- Commitizen配置文件

### .cz-config.yml

- Commitizen配置文件

### .cz-config.ts

- Commitizen配置文件

### .cz-config.js

- Commitizen配置文件

### .cz-config.json

- Commitizen配置文件

### .cz-config.yaml

- Commitizen配置文件

### .cz-config.yml

- Commitizen配置文件

### .cz-config.ts

- Commitizen配置文件

### .cz-config.js

- Commitizen配置文件

### .cz-config.json

- Commitizen配置文件

### .cz-config.yaml

- Commitizen配置文件

### .cz-config.yml

- Commitizen配置文件
