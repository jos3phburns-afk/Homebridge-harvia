import { HarviaDevice, DeviceStateSubscriber } from '../HarviaDevice.js';
import { PlatformAccessory, Logger, API, HAP } from 'homebridge';
import type { Service } from 'homebridge';

export class TemperatureSensorAccessory implements DeviceStateSubscriber {
  private readonly service: Service;
  private readonly Characteristic: HAP['Characteristic'];

  constructor(
    private readonly log: Logger,
    private readonly device: HarviaDevice,
    accessory: PlatformAccessory,
    private readonly hbApi: API
  ) {
    const { Service, Characteristic } = this.hbApi.hap;
    this.Characteristic = Characteristic;

    this.service =
      accessory.getService(Service.TemperatureSensor) ||
      accessory.addService(Service.TemperatureSensor, `${device.name} Temperature`);

    accessory.getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, 'Harvia')
      .setCharacteristic(Characteristic.Model, 'Xenio WiFi')
      .setCharacteristic(Characteristic.SerialNumber, `${device.id}-temperature`);

    this.service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .setProps({ minValue: 0, maxValue: 120, minStep: 0.1 })
      .onGet(() => this.device.currentTemp);

    this.device.subscribe(this);
  }

  public onDeviceUpdate(): void {
    this.service.updateCharacteristic(
      this.Characteristic.CurrentTemperature,
      this.device.currentTemp
    );
  }
}
