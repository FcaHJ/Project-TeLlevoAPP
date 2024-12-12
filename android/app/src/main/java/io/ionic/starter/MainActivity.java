package io.ionic.starter;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.ProcessBuilder;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ruta al directorio donde se encuentra tu archivo index.js
        String nodeJsPath = "/data/data/Project-TeLlevoAPP/android/backend/node_modules/.bin/node"; // Ajusta esta ruta
        String scriptPath = "/Project-TeLlevoAPP/android/backend/index.js"; // Ajusta esta ruta

        try {
            Process process = new ProcessBuilder(nodeJsPath, scriptPath).start();

            // Leer la salida del proceso (opcional)
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                Log.d("Backend", line);
            }

        } catch (Exception e) {
            e.printStackTrace();
            Log.e("Backend", "Error al iniciar el servidor: " + e.getMessage());
        }
    }
}
