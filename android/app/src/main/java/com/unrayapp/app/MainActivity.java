package com.unrayapp.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.app.Notification;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
    }

private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        String channelId = "c116f187-f8ea-4dbe-bd8c-6421c29b1e22";
        String channelName = "Notificaciones Importantes";

        NotificationChannel channel = new NotificationChannel(
            channelId,
            channelName,
            NotificationManager.IMPORTANCE_MAX
        );

        // Definir sonido personalizado
        Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/raw/notificacion_tono");

        AudioAttributes attributes = new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE) // ← Asegura que sea para notificaciones
            .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED) // ← Forzar el sonido
            .build();

            channel.setSound(soundUri, attributes);
            channel.enableVibration(true); // Vibración activada
            channel.enableLights(true); // Luz de notificación activada
            channel.setLightColor(Color.RED);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true); // Ignorar el modo No Molestar
            channel.setDescription("Canal para notificaciones importantes");

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }
}

}
