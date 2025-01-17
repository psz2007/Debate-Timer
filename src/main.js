const initdata = 
`["初始计分","cnt",2,""]
["正方一辩","tmr",240,""] ["反方一辩","tmr",240,""]
["正方二辩","tmr",240,""] ["反方二辩","tmr",240,""]
["正方三辩","tmr",240,""] ["反方三辩","tmr",240,""]
["自由辩论","tmr",900,""]
["反方四辩","tmr",240,""] ["正方四辩","tmr",240,""]
["投票环节","tmr",60,""]
["最终得分","cnt",2,""]`;
let data = initdata;

function parse(s) {
	let l = s.split("\n"), info = [];
	for (let i in l) {
		const tl = l[i].split(" "), n = tl.length;
		if (n == 0) {
			continue;
		}
		let cur = document.createElement("div");
		cur.className = `ui ${n == 1 ? "one" : "two"} column row`;
		for (let j in tl) {
			let t = document.createElement("div"), val = JSON.parse(tl[j]);
			t.className = "column";
			if (val[1] == "cnt") {
				t.innerHTML = `
				<div id="${i}-${j}">
					<div class="title">${val[0] + " " + val[3]}</div>
					<br/>
					<div id="${i}-${j}-prog" class="ui multiple progress">
						<div class="blue bar">
							<div class="progress"></div>
						</div>
						<div class="red bar">
							<div class="progress"></div>
						</div>
						<div class="label"></div>
					</div>
				</div>`
			} else {
				t.innerHTML = `
				<div id="${i}-${j}">
					<div class="title">${val[0] + val[3]}</div>
					<br/>
					<p id="${i}-${j}-timer" class="timer"></p>
					</div>
				</div>`;
			}
			cur.appendChild(t);
			val.push(`${i}-${j}`);
			info.push(val);
		}
		document.getElementById("main").appendChild(cur);
	}
	return info;
}

function getcol(s) {
	if (s[0] == "正") {
		return "red";
	} else if(s[0] == "反") {
		return "blue";
	} else {
		return "grey";
	}
}
function activate(x, col) {
	const cur = document.getElementById(x);
	cur.style = "padding: 5px; border-radius: 5px; border: 2px solid "+col;
}
function deactivate(x) {
	const cur = document.getElementById(x);
	cur.style = "";
}
function formatDate(s, fmt = "yyyy 年 MM 月 dd 日 hh 时 mm 分 ss 秒 SS") {
	if (s == "")
		return "";
	Date.prototype.format = function (fmt) {
		let o = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			"S+": Math.floor(this.getMilliseconds() / 10)
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").slice(4 - RegExp.$1.length));
		}
		for (let k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).slice(("" + o[k]).length)));
			}
		}
		return fmt;
	}
	let t = new Date(s).format(fmt);
	return t.toString();
}

let flg1 = false, flg2 = false, flg3 = false;
function _nxt() {
	flg1 = true;
}
function _chr() {
	flg2 = true;
}
function _pau() {
	flg3 = true;
}

function until(c) {
	const poll = resolve => {
		if(c()) resolve();
		else setTimeout(_ => poll(resolve), 50);
	}
	return new Promise(poll);
}
async function runTimer(w) {
	const t0 = new Date();
	let id = await setInterval((x, lim) => {
		const t = (new Date() - t0);
		document.getElementById(x).innerText = formatDate(t, "mm:ss.SS");
		if (t > lim * 1000) {
			document.getElementById(x).style.color = "red";
		}
		if (flg3) {
			clearInterval(id);
		}
	}, 10, w[4] + "-timer", w[2]);
	await until(() => flg3);
	await until(() => flg1);
	return id;
}
async function runScore(x) {
	await until(() => flg2);
	let v0 = parseInt(document.getElementById("pos").value), v1 = parseInt(document.getElementById("neg").value);
	$("#" + x + "-prog").progress("reset");
	$("#" + x + "-prog").progress("set total", v0 + v1);
	$("#" + x + "-prog").progress("set progress", [v0, v1]);
	$("#" + x + "-prog").progress({
		text: {
			percent: '{bar}:{percent}%',
			bars: ['正方', '反方']
		}
	});
	$("#" + x + "-prog").progress("set label", `正方：${v0} —— 反方:${v1}`);
	await until(() => flg1);
}

async function _pageBuild(){
	const info = parse(data);
	for (let i in info) {
		if (info[i][1] == "tmr") {
			document.getElementById(info[i][4] + "-timer").innerText = "00:00.00";
		}
	}
	for (let i in info) {
		flg1 = flg2 = flg3 = false;
		activate(info[i][4], getcol(info[i][0]));
		if (info[i][1] == "tmr") {
			await runTimer(info[i]);
		} else {
			await runScore(info[i][4]);
		}
		deactivate(info[i][4]);
	}
}
