const int sensorPin = A0;
const int numSamples = 16; // 平滑取樣數，讓數值穩定
int samples[numSamples];
int sampleIndex = 0;

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < numSamples; i++) samples[i] = 0;
}

void loop() {
  // 取樣平滑
  samples[sampleIndex] = analogRead(sensorPin);
  sampleIndex = (sampleIndex + 1) % numSamples;
  long sum = 0;
  for (int i = 0; i < numSamples; i++) sum += samples[i];
  int avgValue = sum / numSamples; // 0~1023

  // 輸出平滑且細膩的數值
  Serial.println(avgValue);

  delay(20); // 更新速度快一點，動畫更即時
}