async function run() {
  const res = await fetch("https://kodak-teaching-education-packets.trycloudflare.com/api/v1/analyze/RELIANCE.NS");
  const data = await res.json();
  console.log(JSON.stringify(data.prophet, null, 2));
}
run();
