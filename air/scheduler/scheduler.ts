async function run() {
  try {
    const res = await fetch('https://air-iils.onrender.com/api/chatservice/scheduleMessages/sendMessage');
    const data = await res.json();
    console.log('Scheduler run result:',Date.now(), data, "  ");
  } catch (err) {
    console.error('Failed to run scheduler:', err);
  }
}

setInterval(run, 10000);