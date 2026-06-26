import test, { expect } from 'playwright/test';
import axios, { AxiosBasicCredentials } from 'axios';
import { API, RESOURCE_API, MQTT, MQTT_INTERNAL } from './helper/urls';
import { createResources, withSetupClient } from './helper/keycloak';
import { RandomTenantManager } from './helper/util';
import mqtt from 'mqtt';
import { checkSQL } from './helper/clickhouse';
import { TESTMQTT_CREDENTIALS } from './helper/mqtt';
import { checkedGraphqlRequest, graphql } from './helper/graphql';

const TENANT_MGR = new RandomTenantManager();

test(
	'ingestor returns 401 for incorrect credentials',
	{
		tag: '@browserless'
	},
	async () =>
		expect(
			(
				await axios.post(`${API}api/v2/sensor/message/direct`, JSON.stringify({}), {
					headers: {
						'Content-Type': 'application/json'
					},
					auth: { username: 'not', password: 'valid' },
					validateStatus: (_) => true
				})
			).status
		).toBe(401)
);

test(
	'ingestor handles all formats',
	{
		tag: '@browserless'
	},
	async () => {
		const tenant = TENANT_MGR.get();
		const directTopic = `direct-${tenant}`;
		const lorawanTopic = `lorawan-${tenant}`;
		const zennerTopic = `zenner-${tenant}`;

		await createResources([`tenants/${tenant}/projects/p`]);
		await withSetupClient(async (realmAdminClient) => {
			await realmAdminClient.put<AxiosBasicCredentials>(
				`${RESOURCE_API}tenants/${tenant}/projects/p/sensor-subscriptions/direct`,
				{
					uri: MQTT_INTERNAL,
					topic: directTopic,
					format: 'direct',
					...TESTMQTT_CREDENTIALS
				}
			);
			await realmAdminClient.put<AxiosBasicCredentials>(
				`${RESOURCE_API}tenants/${tenant}/projects/p/sensor-subscriptions/lorawan`,
				{
					uri: MQTT_INTERNAL,
					topic: lorawanTopic,
					format: 'lorawan',
					...TESTMQTT_CREDENTIALS
				}
			);
			await realmAdminClient.put<AxiosBasicCredentials>(
				`${RESOURCE_API}tenants/${tenant}/projects/p/sensor-subscriptions/zenner`,
				{
					uri: MQTT_INTERNAL,
					topic: zennerTopic,
					format: 'zenner',
					...TESTMQTT_CREDENTIALS
				}
			);
		});

		const mqttClient = mqtt.connect(MQTT, TESTMQTT_CREDENTIALS);
		const directLat = 23;
		const directLon = 42;

		const MQTTPayload = {
			uplink_message: {
				locations: {
					user: {
						latitude: 15,
						longitude: 16
					}
				},
				decoded_payload: {
					air_pressure: 1001,
					AirPressure: 'invalid',
					BatteryLevel: 2.96,
					Humidity: 68.17,
					Status: 0,
					Temperature: 21.16
				}
			}
		};

		const BEEPBASE_VALUES = {
			beep_base: true,
			ds18b20_present: true,
			fft_present: true,
			weight_present: false,
			alarm: 123,
			bat_perc: 124,
			ds18b20_sensor_amount: 125,
			fft_bin_amount: 126,
			fft_hz_per_bin: 127,
			fft_start_bin: 128,
			fft_stop_bin: 130,
			s_bin_122_173: 131,
			s_bin_173_224: 132,
			s_bin_224_276: 133,
			s_bin_276_327: 134,
			s_bin_327_378: 135,
			s_bin_378_429: 136,
			s_bin_429_480: 137,
			s_bin_480_532: 138,
			s_bin_532_583: 139,
			s_bin_71_122: 140,
			w_v: 141,
			weight_sensor_amount: 142,
			bv: 143.3,
			t_i: 144.4
		};

		const makeZennerPayload = (withLocation: boolean, status: string | boolean) => ({
			id: '1e45e06b-d9c2-47ca-8199-69267b52158d',
			data: {
				...(withLocation
					? {
							lat: 51.93,
							lon: 8.38
						}
					: {}),
				uv: 0.5,
				humidity: 30,
				wind_speed: 2.5,
				temperature: 22.5,
				peak_wind_gust: 3.5,
				wind_direction: 294,
				light_intensity: 4,
				rainfall_intensity: 5.5,
				barometric_pressure: 10285,
				cumulative_rainfall: 7.874,
				status,
				battery_level: 3.11,
				moisturePercent1: 26.63,
				moisturePercent2: 16.61,
				moisturePercent3: 9.89,
				moisturePercent4: 1.46,
				soilWaterColumn_dm1: 19.37,
				soilWaterColumn_dm2: 36.89,
				soilWaterColumn_dm3: 52.46,
				soilWaterColumn_dm4: 4.75,
				soilWaterTension_pF1: 2.52,
				soilWaterTension_pF2: 2.94,
				soilWaterTension_pF3: 3.37,
				soilWaterTension_pF4: 3.74,
				temperature_celsius1: 2,
				temperature_celsius2: 4,
				temperature_celsius3: 6,
				temperature_celsius4: 3,
				co2_1: 1337,
				...BEEPBASE_VALUES,
				previous_state_duration_overflow: false,
				previous_state_duration: 1326,
				previous_state_duration_error: 6231
			},
			location: null,
			device_id: 'ecdd8956-0fda-4a6f-b8fe-ff4594dd0478',
			packet_id: '41a9ba67-2e28-44e6-a0ac-e5c1d78e0964',
			parser_id: '4389d02b-618f-4a58-9402-515c5a735c11',
			inserted_at: '2025-02-05T15:20:36.761228+00:00',
			measured_at: '2025-02-05T15:20:34.680564+00:00'
		});

		const zennerPayload = makeZennerPayload(false, 'OK');
		const zennerPayloadWithLocation = makeZennerPayload(true, false);

		mqttClient.on('error', (e) => console.error(e));
		await new Promise((ok) => mqttClient.on('connect', ok));

		await expect(async () => {
			mqttClient.publish(
				directTopic,
				JSON.stringify({ latitude: directLat, longitude: directLon })
			);
			mqttClient.publish(lorawanTopic, JSON.stringify(MQTTPayload));
			mqttClient.publish(zennerTopic, JSON.stringify(zennerPayload));
			mqttClient.publish(zennerTopic, JSON.stringify(zennerPayloadWithLocation));

			await checkSQL(
				`SELECT 1 FROM sensor_messages WHERE project = '${tenant}.p' AND latitude = ${directLat} AND longitude = ${directLon}`
			);
			await checkSQL(
				`SELECT toString(temperature_outside) FROM sensor_messages WHERE 
				project = '${tenant}.p' AND
				latitude = ${MQTTPayload.uplink_message.locations.user.latitude} AND 
				longitude = ${MQTTPayload.uplink_message.locations.user.longitude} AND
				humidity_air = ${MQTTPayload.uplink_message.decoded_payload.Humidity} AND
				battery_voltage = ${MQTTPayload.uplink_message.decoded_payload.BatteryLevel} AND
				air_pressure = ${MQTTPayload.uplink_message.decoded_payload.air_pressure} AND
				status = '${MQTTPayload.uplink_message.decoded_payload.Status}' AND
				abs(temperature_outside - ${MQTTPayload.uplink_message.decoded_payload.Temperature}) < 0.001
				`
			);
			const zennerCheckCommon = `SELECT 1 FROM sensor_messages WHERE
					project = '${tenant}.p' AND
					time = ${Math.floor(new Date(zennerPayload.measured_at).valueOf() / 1000)} AND
					sensor_id = '${zennerPayload.device_id}' AND
					temperature_outside = ${zennerPayload.data.temperature} AND
					uv_index = ${zennerPayload.data.uv} AND
					humidity_air = ${zennerPayload.data.humidity} AND
					air_pressure = ${zennerPayload.data.barometric_pressure / 10} AND
					wind_speed = ${zennerPayload.data.wind_speed} AND
					wind_peak_gust = ${zennerPayload.data.peak_wind_gust} AND
					wind_direction = ${zennerPayload.data.wind_direction} AND
					light_intensity = ${zennerPayload.data.light_intensity} AND
					rain_intensity = ${zennerPayload.data.rainfall_intensity} AND
					rain_accumulated = ${zennerPayload.data.cumulative_rainfall} AND
					soil_moisture1 = ${zennerPayload.data.moisturePercent1} AND
					soil_moisture2 = ${zennerPayload.data.moisturePercent2} AND
					soil_moisture3 = ${zennerPayload.data.moisturePercent3} AND
					soil_moisture4 = ${zennerPayload.data.moisturePercent4} AND
					soil_water_column1 = ${zennerPayload.data.soilWaterColumn_dm1} AND
					soil_water_column2 = ${zennerPayload.data.soilWaterColumn_dm2} AND
					soil_water_column3 = ${zennerPayload.data.soilWaterColumn_dm3} AND
					soil_water_column4 = ${zennerPayload.data.soilWaterColumn_dm4} AND
					soil_water_tension1 = ${zennerPayload.data.soilWaterTension_pF1} AND
					soil_water_tension2 = ${zennerPayload.data.soilWaterTension_pF2} AND
					soil_water_tension3 = ${zennerPayload.data.soilWaterTension_pF3} AND
					soil_water_tension4 = ${zennerPayload.data.soilWaterTension_pF4} AND
					soil_temperature1 = ${zennerPayload.data.temperature_celsius1} AND
					soil_temperature2 = ${zennerPayload.data.temperature_celsius2} AND
					soil_temperature3 = ${zennerPayload.data.temperature_celsius3} AND
					soil_temperature4 = ${zennerPayload.data.temperature_celsius4} AND
					${Object.entries(BEEPBASE_VALUES)
						.map(([k, v]) => `bp_${k} = ${v}`)
						.join(' AND ')} AND
					previous_state_duration_overflow_parking = ${zennerPayload.data.previous_state_duration_overflow} AND
					previous_state_duration_parking = ${zennerPayload.data.previous_state_duration} AND
					previous_state_duration_error_parking = ${zennerPayload.data.previous_state_duration_error} AND
					co2 = ${zennerPayload.data.co2_1}`;
			await checkSQL(
				`${zennerCheckCommon}
					AND latitude IS NULL
					AND longitude IS NULL
					AND status = 'OK'
					AND status_parking IS NULL
				`
			);
			await checkSQL(
				`${zennerCheckCommon}
					AND latitude = ${zennerPayloadWithLocation.data.lat}
					AND longitude = ${zennerPayloadWithLocation.data.lon}
					AND status IS NULL
					AND status_parking = false
				`
			);
		}).toPass({ intervals: [1000] });

		await expect(async () => {
			const result = await checkedGraphqlRequest(
				graphql`
					query ($tenant: String!, $project: String!) {
						project(tenant: $tenant, project: $project) {
							sensorSubscriptions {
								sensorSubscription
								connection {
									error
									lastMessageTimestamp
									state
								}
							}
						}
					}
				`,
				{
					tenant,
					project: 'p'
				}
			);
			expect(result).toEqual({
				errors: [],
				data: {
					project: {
						sensorSubscriptions: [
							{
								sensorSubscription: 'direct',
								connection: {
									state: 'CONNECTED',
									lastMessageTimestamp: expect.any(String)
								}
							},
							{
								sensorSubscription: 'lorawan',
								connection: {
									state: 'CONNECTED',
									lastMessageTimestamp: expect.any(String)
								}
							},
							{
								sensorSubscription: 'zenner',
								connection: {
									state: 'CONNECTED',
									lastMessageTimestamp: expect.any(String)
								}
							}
						]
					}
				},
				dataPresent: true
			});
		}).toPass({ intervals: [1_000], timeout: 15_000 });
	}
);
