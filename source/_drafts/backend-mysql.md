---
title: backend-mysql
tags:
---
mysql 数据库实战宝典。

<!--more-->

不推荐使用整型类型的属性 Unsigned，若非要使用，参数 sql_mode 务必额外添加上选项 NO_UNSIGNED_SUBTRACTION；

用自增整型做主键，一律使用 BIGINT，而不是 INT。

在海量互联网业务的设计标准中，并不推荐用 DECIMAL 类型，而是更推荐将 DECIMAL 转化为 整型类型

所以在 MySQL 数据库下，绝大部分场景使用类型 VARCHAR 就足够了。

推荐把 MySQL 的默认字符集设置为 UTF8MB4

```Shell
CREATE TABLE User (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    sex CHAR(1) NOT NULL,
    password VARCHAR(1024) NOT NULL,
    regDate DATETIME NOT NULL,
    CHECK (sex = 'M' OR sex = 'F'),
    PRIMARY KEY(id)
);
```
