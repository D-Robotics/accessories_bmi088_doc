---
sidebar_position: 2
title: 1 C API
---

# C API Reference

## File Layout

The C portion of the RDK IMU Module SDK lives in `rdk-imu-module-sdk/core`. It is also a dependency for the Python API and ROS2 package. The `core` directory contains:

Before build:

```text
core/
├── Makefile         # Build tool
├── examples/        # Test cases
├── include
│   └── rdkimu.h     # API header
└── src
    ├── rdkimu_bus.c # Bus abstraction
    ├── rdkimu.c     # Core implementation
    └── rdkimu_priv.h # Private header
```

After build:

```text
core/
├── Makefile
├── examples/
├── include/
├── build/           # Intermediate build artifacts
├── lib/             # Static and shared libraries
├── out/             # Executables
└── src/
```

## Build Instructions

From the `core` directory:

- `make` — full build; produces test executables, static library, and versioned shared libraries with symlinks.
- `make test` — build and run `out/test`.
- `make install` — install headers and libraries to system paths for use from other projects.
- `make uninstall` — remove installed headers and libraries.
- `make clean` — remove build artifacts.

## API Reference

### 1. Obtaining a Handle

The IMU device is represented by a handle of type `rdk_imu_state_t`. Do not declare a handle directly as `rdk_imu_state_t imu_st`, because `rdk_imu_state_t` is an opaque forward declaration in the header and the compiler cannot determine its size.

```c
/* Incorrect */
rdk_imu_state_t imu_st;
```

Use `rdk_imu_create_default` to obtain a properly initialized pointer:

```c
/* Correct handle initialization */
rdk_imu_state_t *imu_st = rdk_imu_create_default();
```

All subsequent operations use a pointer to `rdk_imu_state_t`, not the struct by value.

### 2. Bus Configuration

`rdk_imu_bus_init` auto-discovers available IMU devices and initializes the bus, or initializes the bus according to `bus_info`.

```c
rdk_imu_err_t rdk_imu_bus_init(
    rdk_imu_state_t* st,
    rdk_imu_bus_info_t bus_info);
```

Three initialization modes are supported:

- Auto-search across I2C and SPI, auto-detect addresses, and verify the IMU is online. Not suitable when multiple IMU devices are connected.
- Specify I2C and provide accelerometer and gyroscope bus numbers and device addresses; the SDK validates the devices.
- Specify SPI and provide accelerometer and gyroscope bus numbers, chip-select lines, and clock rates; the SDK validates the devices.

Auto-discovery:

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_bus_info_t bus_info;
bus_info.interface = RDK_IMU_AUTO;

rdk_imu_err_t ret = rdk_imu_bus_init(imu_st, bus_info);
if (ret != RDK_IMU_OK) return ret;
```

Specify I2C:

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_bus_info_t bus_info;
/* Use I2C */
bus_info.interface = RDK_IMU_I2C;
/* Accel on I2C-5, 7-bit address 0x19 */
/* Gyro on I2C-5, 7-bit address 0x68 */
bus_info.bus.i2c.accel.bus = 1;
bus_info.bus.i2c.accel.addr = 0x19;
bus_info.bus.i2c.gyro.bus = 1;
bus_info.bus.i2c.gyro.addr = 0x68;
rdk_imu_err_t ret = rdk_imu_bus_init(imu_st, bus_info);
if (ret != RDK_IMU_OK) return ret;
```

Specify SPI:

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_bus_info_t bus_info;
/* Use SPI */
bus_info.interface = RDK_IMU_SPI;
/* Accel: /dev/spidev1.0 at 1 MHz */
/* Gyro: /dev/spidev1.1 at 1 MHz */
bus_info.bus.spi.accel.bus = 1;
bus_info.bus.spi.accel.cs = 0;
bus_info.bus.spi.accel.speed_hz = 1000000;
bus_info.bus.spi.gyro.bus = 1;
bus_info.bus.spi.gyro.cs = 1;
bus_info.bus.spi.gyro.speed_hz = 1000000;
rdk_imu_err_t ret = rdk_imu_bus_init(imu_st, bus_info);
if (ret != RDK_IMU_OK) return ret;
```

### 3. Device Configuration

Use `rdk_imu_device_init` to configure IMU properties: range, bandwidth, sample rate, interrupt settings, software FIFO, and interrupt thread options.

```c
rdk_imu_err_t rdk_imu_device_init(
    rdk_imu_state_t* st,
    rdk_imu_config_t config);
```

Configure via members of `rdk_imu_config_t`:

| Member | Type | Value | Desc |
| --- | --- | --- | --- |
| accel_bwp | rdk_imu_accel_bwp_t | • RDK_IMU_OSR4<br/>• RDK_IMU_OSR2<br/>• RDK_IMU_NORMAL | <br/>• Accelerometer filter option; effective bandwidth depends on ODR—see the datasheet<br/>• RDK_IMU_OSR4 has the lowest bandwidth and noise; RDK_IMU_NORMAL has the highest<br/>• Lower noise trades off response speed |
| accel_odr | rdk_imu_accel_odr_t | • RDK_IMU_ACCEL_12_5<br/>• RDK_IMU_ACCEL_25<br/>• RDK_IMU_ACCEL_50<br/>• RDK_IMU_ACCEL_100<br/>• RDK_IMU_ACCEL_200<br/>• RDK_IMU_ACCEL_400<br/>• RDK_IMU_ACCEL_800<br/>• RDK_IMU_ACCEL_1600 | Accelerometer output data rate in Hz |
| accel_range | rdk_imu_accel_range_t | • RDK_IMU_ACCEL_3G<br/>• RDK_IMU_ACCEL_6G<br/>• RDK_IMU_ACCEL_12G<br/>• RDK_IMU_ACCEL_24G | Accelerometer full-scale range; names denote bidirectional range, e.g. RDK_IMU_ACCEL_3G means ±3 g |
| gyro_range | rdk_imu_gyro_range_t | • RDK_IMU_GYRO_2000DPS<br/>• RDK_IMU_GYRO_1000DPS<br/>• RDK_IMU_GYRO_500DPS<br/>• RDK_IMU_GYRO_250DPS<br/>• RDK_IMU_GYRO_125DPS | Gyroscope full-scale range; names denote bidirectional range, e.g. RDK_IMU_GYRO_2000DPS means ±2000 °/s |
| gyro_bandwidth | rdk_imu_gyro_bandwidth_t | • RDK_IMU_ODR2000_BW532<br/>• RDK_IMU_ODR2000_BW230<br/>• RDK_IMU_ODR1000_BW116<br/>• RDK_IMU_ODR400_BW47<br/>• RDK_IMU_ODR200_BW23<br/>• RDK_IMU_ODR100_BW12<br/>• RDK_IMU_ODR200_BW64<br/>• RDK_IMU_ODR100_BW32 | Gyroscope ODR and bandwidth; ODR and bandwidth are selected together |
| accel_drdy_int | rdk_imu_accel_drdy_int_t | • RDK_IMU_INT1<br/>• RDK_IMU_INT2 | Accelerometer data-ready interrupt pin |
| accel_int_gpio_mode | rdk_imu_gpio_mode_t | • RDK_IMU_PP_H<br/>• RDK_IMU_PP_L<br/>• RDK_IMU_OD_H<br/>• RDK_IMU_OD_L | Accelerometer interrupt pin electrical mode on the IMU side:<br/>• PP = push-pull<br/>• OD = open-drain<br/>• H = active high<br/>• L = active low |
| gyro_drdy_int | rdk_imu_gyro_drdy_int_t | • RDK_IMU_INT3<br/>• RDK_IMU_INT4 | Gyroscope data-ready interrupt pin |
| gyro_int_gpio_mode | rdk_imu_gpio_mode_t | • RDK_IMU_PP_H<br/>• RDK_IMU_PP_L<br/>• RDK_IMU_OD_H<br/>• RDK_IMU_OD_L | Gyroscope interrupt pin electrical mode on the IMU side:<br/>• PP = push-pull<br/>• OD = open-drain<br/>• H = active high<br/>• L = active low |
| accel_drdy_gpio_chip | uint32_t | - | SoC GPIO chip number for accelerometer interrupt |
| accel_drdy_gpio_line | uint32_t | - | SoC GPIO line number for accelerometer interrupt |
| gyro_drdy_gpio_chip | uint32_t | - | SoC GPIO chip number for gyroscope interrupt |
| gyro_drdy_gpio_line | uint32_t | - | SoC GPIO line number for gyroscope interrupt |
| fifo_length | uint32_t | 2^n | Software FIFO length; must be a power of 2; 256 or larger is recommended |
| fifo_mode | rdk_imu_fifo_mode_t | • RDK_IMU_FIFO_DROP<br/>• RDK_IMU_FIFO_OVERWRITE | FIFO write policy when full: RDK_IMU_FIFO_DROP discards new data; RDK_IMU_FIFO_OVERWRITE overwrites the oldest data |
| irq_priority | int32_t | -1 ~ 99 | Real-time priority of the interrupt capture thread; 99 is highest, 0 is lowest; -1 auto-selects the highest priority available to the current process; higher priorities may require sudo |
| irq_thread_timeout_ns | uint64_t | - | Timeout in the interrupt capture loop, in nanoseconds; too small increases CPU load, too large increases shutdown wait time; 1e9 is recommended |

You do not need to set every field individually. The public header `rdkimu.h` provides default configuration macros for common boards. Initialize `rdk_imu_config_t` from a macro and override as needed. `RDK_IMU_X5_DEFAULT_CONFIG`:

```c
#define RDK_IMU_X5_DEFAULT_CONFIG { \
    .accel_drdy_int = RDK_IMU_INT1, \
    .accel_int_gpio_mode = RDK_IMU_PP_H, \
    .accel_drdy_gpio_chip = 4, \
    .accel_drdy_gpio_line = 2, \
    .gyro_drdy_int = RDK_IMU_INT3, \
    .gyro_int_gpio_mode = RDK_IMU_PP_H, \
    .gyro_drdy_gpio_chip = 3, \
    .gyro_drdy_gpio_line = 12, \
    .irq_priority = -1, \
    .irq_thread_timeout_ns = 1000000000, \
    .accel_bwp = RDK_IMU_NORMAL, \
    .accel_range = RDK_IMU_ACCEL_24G, \
    .accel_odr = RDK_IMU_ACCEL_400, \
    .gyro_range = RDK_IMU_GYRO_2000DPS, \
    .gyro_bandwidth = RDK_IMU_ODR400_BW47, \
    .fifo_length = 256, \
    .fifo_mode = RDK_IMU_FIFO_OVERWRITE, \
}
```

Example: start from the default macro, change selected fields, and initialize:

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
/* Use RDK X5 template */
rdk_imu_config_t config = RDK_IMU_X5_DEFAULT_CONFIG;
/* Change accelerometer range */
config.accel_range = RDK_IMU_ACCEL_12G;
/* Initialize device */
rdk_imu_err_t ret = rdk_imu_device_init(imu_st, config);
if (ret != RDK_IMU_OK) return ret;
```

To change configuration after initialization, disable the device first (see below).

### 4. Enable Data Acquisition

After bus and device initialization return `RDK_IMU_OK` (0), call `rdk_imu_enable` to start data acquisition.

```c
rdk_imu_err_t rdk_imu_enable(
    rdk_imu_state_t* st);
```

In single-threaded user-space C code, blocking GPIO interrupt handling and I2C register access can cause ODR frame drops. When an interrupt triggers a read, CPU scheduling delay may cause data to be fetched several ODR cycles late, and timestamps may be assigned to the wrong frames.

Kernel drivers largely avoid this because kernel scheduling priority is typically higher than user space. To stay decoupled from kernel drivers, the SDK uses a general user-space approach: a high-priority worker thread loops on GPIO user-space interrupts, reads data, stamps frames with hardware event timestamps from `gpiod.h`, and stores samples in a locked software FIFO for other API calls to consume.

After enable, the worker thread starts and the FIFO begins filling:

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_err_t ret = rdk_imu_enable(imu_st);
if (ret != RDK_IMU_OK) return ret;
```

`rdk_imu_enable` is thread-safe. Only one caller succeeds with `RDK_IMU_OK` (0) before `rdk_imu_disable`; duplicate enable attempts return `RDK_IMU_DEVICE_BUSY`.

### 5. Reading IMU Data

As of v1.0.0, three read APIs are available:

- FIFO depth:

```c
rdk_imu_err_t rdk_imu_fifo_available(
    rdk_imu_state_t *st,
    uint32_t *count);
```

- Independent (single-sensor) frame:

```c
rdk_imu_err_t rdk_imu_read_indep(
    rdk_imu_state_t *st,
    rdk_imu_6_axis_data_t *data,
    uint32_t *count);
```

- Fused (interpolated) frame:

```c
rdk_imu_err_t rdk_imu_read_fused(
    rdk_imu_state_t *st,
    rdk_imu_6_axis_data_t *data,
    rdk_imu_device_t fuse_by,
    uint64_t max_age_ns);
```

All three are thread-safe.

**Independent vs. fused reads**

On BMI088, the accelerometer and gyroscope behave as two independent devices in electrical properties, addresses, physical isolation, clock division, and data correlation—they share only physical placement. They use separate interrupt lines; even with the same ODR, their data-ready events do not align. You cannot read a natively time-synchronized 6-axis sample—only two 3-axis samples with aligned timestamps stored in one FIFO.

`rdk_imu_read_indep` returns a raw FIFO entry. `*count` is the remaining FIFO depth after the read. Of `data->accel` and `data->gyro`, only one side is valid—check `data.accel.valid` and `data.gyro.valid`:

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_6_axis_data_t data;
uint32_t count;
/* Read independent frame */
rdk_imu_err_t ret = rdk_imu_read_indep(imu_st, &data, &count);
if (ret != RDK_IMU_OK) return ret;
if (data.accel.valid && !data.gyro.valid) {
    /* Accelerometer frame valid */
} else if (!data.accel.valid && data.gyro.valid) {
    /* Gyroscope frame valid */
} else {
    /* Invalid state */
}
```

Applications can read multiple independent frames and fuse them with interpolation to combine 6-axis data at a chosen timestamp.

`rdk_imu_read_fused` performs simple 1D linear interpolation. Use `fuse_by` to choose accelerometer or gyroscope as the reference side; the other axis is interpolated to that timestamp. Output rate is the minimum of accelerometer and gyroscope ODR.  
`fuse_by` is `rdk_imu_device_t`: `RDK_IMU_ACCEL` or `RDK_IMU_GYRO`.  
`max_age_ns` is the maximum time gap allowed for interpolation; if the span exceeds this value, interpolation fails and the call blocks until a valid fused sample is available. Set it to at least 3× the ODR period.

Example: use accelerometer as reference with a 50 ms interpolation window:

```c
rdk_imu_state_t *imu_st = rdk_imu_create_default();
/* ... */
rdk_imu_6_axis_data_t data;
/* Read fused frame; max interpolation gap 50 ms */
rdk_imu_err_t ret = rdk_imu_read_fused(imu_st, &data, RDK_IMU_ACCEL, 5e7);
if (ret != RDK_IMU_OK) return ret;
```

`rdk_imu_6_axis_data_t` layout:

```c
typedef struct {
    float x, y, z;
    uint64_t timestamp_ns;
    int32_t valid;
} rdk_imu_3_axis_data_t;

typedef struct {
    rdk_imu_3_axis_data_t accel, gyro;
} rdk_imu_6_axis_data_t;
```

Where:

- `x`, `y`, `z`: processed axis values; m/s² for accelerometer, °/s for gyroscope.
- `timestamp_ns`: SoC timestamp at sample time in nanoseconds; v1.0.0 uses `CLOCK_MONOTONIC` from `gpiod.h`.
- `valid`: 0 means valid; any other value means invalid.

### 6. Disable Data Acquisition

Call `rdk_imu_disable` to stop the interrupt thread and FIFO filling.

```c
rdk_imu_err_t rdk_imu_disable(
    rdk_imu_state_t* st);
```

### 7. Deinitialize Device

Call `rdk_imu_device_deinit` to deinitialize the IMU device.

```c
rdk_imu_err_t rdk_imu_device_deinit(
    rdk_imu_state_t* st);
```

### 8. Deinitialize Bus

Call `rdk_imu_bus_deinit` to release bus resources.

```c
rdk_imu_err_t rdk_imu_bus_deinit(
    rdk_imu_state_t* st);
```

### 9. Destroy Handle

Call `rdk_imu_destroy` to safely free the IMU handle.

```c
rdk_imu_err_t rdk_imu_destroy(
    rdk_imu_state_t *st);
```

## Integration Guide

To prevent misuse, public and private headers are separated. After building, private header content is embedded in the libraries and the private header is no longer needed at link time.

In your project, ensure `rdkimu.h` is on the include path, link with `-lrdkimu`, and that `libgpiod.so.2.x.x` is available on the library path.

When copying shared libraries from `core/lib`, use `cp -a` to preserve symlinks, or use `make install` / `make uninstall` from this project's Makefile.
