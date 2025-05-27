export const playNotificationSound = () => {
  const notificationSound = new Audio("/resources/tap-notification.mp3");
  notificationSound.play().catch(err => {
    console.error("Audio play failed:", err);
  });
};
