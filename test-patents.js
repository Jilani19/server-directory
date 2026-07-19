const axios = require('axios');
async function test() {
  const url = `https://api.patentsview.org/patents/query?q={"_text_any":{"assignee_organization":"AbbVie"}}&f=["patent_number","patent_title","patent_date"]`;
  try {
    const res = await axios.get(url, { timeout: 10000 });
    console.log("Patents keys:", Object.keys(res.data));
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
