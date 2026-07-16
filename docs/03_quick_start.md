---
sidebar_position: 3
---

# 3.3 快速开始

## SDK 获取

RDK IMU Module SDK 是 D-Robotics 为 RDK IMU 模组开发的软件开发工具，包括 C 语言、Python 和 ROS2 部分。无需系统驱动，支持硬件时间戳，构建简单，开发者可以使用本 SDK 选择自己喜欢的开发方式，快速体验 RDK IMU 模组功能，并基于 SDK 进行二次开发，快速构建自己的机器人应用开发项目。

代码仓库：[rdk-imu-module-sdk](https://github.com/D-Robotics/rdk-imu-module-sdk)

在开发板中克隆代码仓库主分支：

```bash
git clone https://github.com/D-Robotics/rdk-imu-module-sdk.git
```

SDK 仓库结构说明如下：

```text
rdk-imu-module-sdk/
├── core/       # C 封装与示例
├── python/     # Python 封装与示例
├── ros2/       # ROS2 封装与示例
├── Makefile    # 构建 Makefile
├── doc/
├── README_cn.md
├── README.md
├── LICENSE
└── version/    # 版本信息
```

安装环境依赖（RDK 系统自带）：

```bash
sudo apt update
sudo apt install build-essential cmake libgpiod-dev python3-pip
pip install setuptools wheel
```

## 运行 C 示例

进入 `core` 目录中构建项目：

```bash
cd core
make
```

构建完成后，生成了 `out/test` 执行文件，该文件会自动检测接入的 IMU 的接口类型（I2C/SPI）和设备地址，以 400Hz 的频率输出 IMU 数据。

使用 `sudo ./out/test` 可以看到以下输出（如果是 SPI 接口，初始化会比较慢，只要终端没报错一直等待即可），`Ctrl+C` 可退出。

![SPI 接口初始化较慢](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_spi_init.png)

此外，也可以使用 `make test` 快速构建并运行示例。

![快速构建并运行示例](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_make_test.png)

还可以通过 `make install` 将 SDK 头文件和库文件安装到系统路径中，或使用 `make uninstall` 卸载。

## 运行 Python 示例

保证 `core` 目录已被构建过且未被清理，然后进入 `python` 目录中构建项目：

```bash
cd python
make
```

构建完成后，`dist` 目录下会生成 `.whl` 包，将其安装到系统中：

```bash
pip install dist/rdkimu-*.whl
```

或者使用 `make install` 命令自动构建并安装（卸载同样用 `make uninstall`）。

安装完成后，输入 `sudo python3 examples/test_imu.py` 运行 Python 示例，行为与 C 示例同理，`Ctrl+C` 可退出。

![Python 示例运行](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_python_example.png)

## 运行 ROS2 示例

保证 `core` 目录已被构建过且未被清理，激活 ROS2 环境，然后进入 `ros2` 目录中构建项目：

```bash
source /opt/tros/*/setup.bash  # 这里以 tros 为例，ros2 的其他版本就激活对应环境即可
colcon build
```

构建完成后，安装功能包，然后用 launch 方式启动节点：

```bash
source install/setup.bash
ros2 launch rdk_imu_module rdk_imu.launch.py
```

输出如下，表示 IMU 节点已启动，默认 IMU 话题名称为 `/rdkimu/data`。

![ROS2 示例运行](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_ros2_example.png)

另起一个终端，激活环境，可以使用 `ros2 topic` 命令查看 IMU 数据。

![ROS2 示例运行](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/accessories/03_imu_module/zh/imu_module_ros2_topic.png)


## 下一步指引

至此，通过 SDK 源码包，RDK IMU 模组已经被点亮。

- [硬件说明](./04_hardware.md) 中详细介绍了 RDK IMU 模组的硬件参考，建议硬件开发者阅读。
- [软件说明](./05_software/01_overview.md) 汇总 SDK 二次开发与 IIO 驱动指引，建议软件开发者从概述页进入各子章节阅读：
  - [C-API 使用说明](./05_software/02_c_api.md)
  - [Python-API 使用说明](./05_software/03_python_api.md)
  - [SDK ROS2 功能包使用说明](./05_software/04_ros2.md)
  - [RDK OS IIO 驱动使用说明](./05_software/05_iio.md)
