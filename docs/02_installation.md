---
sidebar_position: 2
---

# 3.2 安装方法

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 物品清单

安装模组需要准备以下物品：


  | 物品名称 | 物品图片 |
  | --- | --- |
  | RDK IMU 模组 | <img className="table-item-image" src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_module.png" alt="RDK IMU 模组" /> |
  | 开发板（适用板卡中支持的开发板） | <img className="table-item-image" src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_supported_board.png" alt="开发板" /> |

## 安装与连接

以下以 RDK X5 开发板为例，展示 RDK IMU 模组的安装方式。若连接其他开发板，需要注意 40PIN 接口的方向，切勿接反。

1. 对齐 IMU 模组核心板的 2×7 排针和 IMU 模组载板的 2×7 排母，垂直插入。
2. 对齐 IMU 模组载板的 40PIN 排母和开发板的 40PIN 排针，垂直插入，完成连接。

![RDK IMU 安装连接](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_installation_connection.png)

如果希望 IMU 模组与开发板之间保持刚性，可以自制支撑结构，下图展示通过 7 颗 M2.5×11 铜柱和若干 M2.5 螺栓安装 IMU 模组的方式。

![RDK IMU 刚性安装](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_rigid_mount.png)

