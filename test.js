// no require

async function test() {
    try {
        const res = await fetch("https://peachpuff-manatee-218248.hostingersite.com/api/index.php?action=login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: "admin", password: "admin123" })
        });
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("BODY:", text);
    } catch(e) {
        console.error(e);
    }
}
test();
