---
sidebar_position: 3
title: 2 Python API
---

# Python API Reference

## File Layout

The Python portion of the RDK IMU Module SDK is in `rdk-imu-module-sdk/python`. It depends on the C API. The `python` directory contains:

Before build:

```text
python/
├── examples
│   ├── imu_stress_test.py  # Stress test
│   └── test_imu.py         # Simple test
├── Makefile                # Build tool
├── rdkimu
│   ├── imu.py              # API type wrappers
│   └── __init__.py         # API exports
└── setup.py                # Build script
```

After build:

```text
python/
├── build/                  # Build artifacts
├── dist/                   # Wheel package (.whl)
├── examples/
├── Makefile
├── rdkimu/
├── rdkimu.egg-info/        # Package metadata
└── setup.py
```

## Build Instructions

Before building the Python API, compile the C API shared library so `core/lib` contains `.so`, `.so.x`, and `.so.x.x.x`. The Python API depends on that library; the Makefile detects and bundles it into the `.whl` automatically.

From the `python` directory:

- `make` — full build; main output is `python/dist/*.whl`.
- `make install` — install the wheel to the system Python environment.
- `make uninstall` — remove the installed wheel.
- `make clean` — remove build artifacts.

## API Reference

The Python API wraps the C shared library with `ctypes` and exposes an object-oriented `IMU` class. Methods raise `RuntimeError` on failure and return data on success.

### Class `IMU`

```python
from rdkimu import IMU
```

**Constructor:**

```python
imu = IMU()                          # Auto-find librdkimu.so
imu = IMU(lib_path="./librdkimu.so") # Specify library path
```

- Loads the C library and creates a device handle.
- Raises `RuntimeError` if the library cannot be found.

Call order matches the C API: `bus()` → `config()` → `enable()` → `read_*()` → `disable()` → automatic cleanup on exit.

### 1. Bus Configuration

Use the `.bus` method:

```python
def bus(self,
        interface=RDK_IMU_INTERFACE.AUTO,
        i2c_accel_bus=0, i2c_accel_addr=0x18,
        i2c_gyro_bus=0, i2c_gyro_addr=0x68,
        spi_accel_bus=0, spi_accel_cs=0, spi_accel_speed=1000000,
        spi_gyro_bus=0, spi_gyro_cs=1, spi_gyro_speed=1000000):
```

- `interface`: communication interface; default `AUTO` for auto-scan, or specify `I2C` or `SPI`.
- With auto-scan, device addresses are optional; with I2C/SPI, pass bus number, address, chip select, speed, etc. as keyword arguments.

### 2. Device Configuration

Use the `.config` method:

```python
def config(self, config_dict):
```

- `config_dict`: Python dict with all or partial settings; keys match `RDK_IMU_CONFIG` struct members.
- Predefined board defaults are available, e.g. `RDK_X5_DEFAULT_CONFIG`.
- Partial overrides are supported—for example, change accelerometer range only:

```python
from rdkimu import IMU, RDK_X5_DEFAULT_CONFIG
from rdkimu.imu import RDK_IMU_ACCEL_RANGE

my_config = dict(RDK_X5_DEFAULT_CONFIG)
my_config['accel_range'] = RDK_IMU_ACCEL_RANGE.RANGE_12G
imu.config(my_config)
```

Supported keys and values match the C API; see the `rdk_imu_config_t` table in [C API Reference](./02_c_api.md). Common keys include `accel_odr`, `accel_range`, `gyro_range`, `gyro_bandwidth`, `fifo_length`, etc.

### 3. Enable and Disable

Use `.enable()` and `.disable()` to start and stop the IMU:

```python
imu.enable()   # Start interrupt thread and fill FIFO
imu.disable()  # Stop data acquisition
```

`enable()` is idempotent at the Python level, but only the first successful call takes effect; subsequent calls return an error (thread safety enforced in the C library).

### 4. Reading Data

Query FIFO depth:

```python
count = imu.fifo_available()  # Frames currently available
```

Read independent (single-sensor) frames:

```python
data, remaining = imu.read_indep()
```

- `data`: `RDK_IMU_6_AXIS_DATA`; check `data.accel.valid` and `data.gyro.valid` for which side is valid.
- `remaining`: FIFO depth after the read.

Read fused (interpolated) 6-axis data:

```python
data = imu.read_fused(fuse_by=RDK_IMU_DEVICE.ACCEL, max_age_ns=50000000)
```

- `fuse_by`: reference sensor—`RDK_IMU_DEVICE.ACCEL` or `RDK_IMU_DEVICE.GYRO`.
- `max_age_ns`: maximum interpolation time window in nanoseconds; calls block if exceeded; set to at least 3× the ODR period (e.g. at 400 Hz, period 2.5 ms, use 7500000 ns).

### 5. Data Structures

`RDK_IMU_6_AXIS_DATA` contains two `RDK_IMU_3_AXIS_DATA` members:

- `data.accel`: accelerometer (`x, y, z, timestamp_ns, valid`).
- `data.gyro`: gyroscope (`x, y, z, timestamp_ns, valid`).

Where:

- `x, y, z`: `float`; m/s² for accelerometer, °/s for gyroscope.
- `timestamp_ns`: `int`; hardware timestamp in nanoseconds based on `CLOCK_MONOTONIC`.
- `valid`: `int`; 0 means valid.

### 6. Resource Cleanup

Prefer a context manager or call `imu.close()` explicitly:

```python
with IMU() as imu:
    imu.bus()
    imu.config(RDK_X5_DEFAULT_CONFIG)
    imu.enable()
    data = imu.read_fused()
```

Leaving the `with` block disables the device and releases bus resources and the handle. Without a context manager, call `imu.close()` or at least `imu.disable()` before exit.
