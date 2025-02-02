const initdata = 
`["初始计分","cnt",2,""]
["正方一辩","tmr",240,""] ["反方一辩","tmr",240,""]
["正方二辩","tmr",240,""] ["反方二辩","tmr",240,""]
["正方三辩","tmr",240,""] ["反方三辩","tmr",240,""]
["自由辩论","tmr",900,""]
["反方四辩","tmr",240,""] ["正方四辩","tmr",240,""]
["投票环节","tmr",60,""]
["最终得分","cnt",2,""]`;
let data = initdata, ts = [];

function parse(s) {
	document.getElementById("main").innerHTML = "";
	let l = s.split("\n"), info = [];
	ts = [];
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
				t.innerHTML =
				`<div id="${i}_${j}" class="ui segment">
					<div class="title" id="${i}_${j}_title">${val[0]}</div>
					<br/>
					<div id="${i}_${j}_prog" class="ui multiple progress">
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
				t.innerHTML = 
				`<div id="${i}_${j}" class="ui segment">
					<div class="title" id="${i}_${j}_title">${val[0] + " " + val[3]}</div>
					<br/>
					<p id="${i}_${j}_timer" class="timer"></p>
					</div>
				</div>`;
			}
			cur.appendChild(t);
			val.push(`${i}_${j}`);
			info.push(val);
			if (val[1] == "tmr") {
				let v = document.createElement("div");
				v.className = "ui labeled small input";
				v.innerHTML += 
				`<div class="ui label">${val[0]}</div>
				<input name="${i}_${j}_set" type="text">`;
				document.getElementById("names").appendChild(v);
				ts.push([val[0], `${i}_${j}`]);
			}
		}
		document.getElementById("main").appendChild(cur);
	}
	document.getElementById("names").innerHTML +=
	`<button class="ui primary button" onclick="_input()">填入</button>`;
	return info;
}

function getcol(s) {
	if (s[0] == "正") {
		return "red";
	} else if (s[0] == "反") {
		return "blue";
	} else {
		return "grey";
	}
}
function inv(s) {
	if (s == "red") {
		return "blue";
	} else if (s == "blue") {
		return "red";
	} else {
		return "black";
	}
}
function activate(x, ty, col) {
	const cur = document.getElementById(x);
	cur.className = `ui ${col} tertiary inverted segment`;
	let t = document.createElement("div");
	t.style = "text-align: center";
	if (ty == "tmr") {
		t.innerHTML = 
		`<button class="ui button" onclick="_pau()">停止</button>
		<button class="ui primary button" onclick="_nxt()">下一步</button>
		<div id="${x}_timer_prog" class="ui tiny attached progress">
			<div class="${inv(col)} bar">
				<div class="progress"></div>
			</div>
		</div>`;
	} else {
		t.innerHTML = 
		`<div class="ui input">
			<input id="pos" type="text" placeholder="正方">
		</div>
		<div class="ui input">
			<input id="neg" type="text" placeholder="反方">
		</div>
		<button class="ui button" onclick="_chr()">确认</button>
		<button class="ui primary button" onclick="_nxt()">下一步</button>`;
	}
	cur.appendChild(t);
}
function deactivate(x) {
	const cur = document.getElementById(x);
	cur.className = "ui segment";
	cur.removeChild(cur.lastChild);
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
	flg1 = true; flg2 = flg3 = false;
}
function _chr() {
	flg2 = true; flg1 = false;
}
function _pau() {
	flg3 = true; flg1 = false;
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
		$('.ui.tiny.attached.progress').progress('set percent', Math.min(t / lim / 10, 100.));
		if (flg3) {
			clearInterval(id);
		}
	}, 10, w[4] + "_timer", w[2]);
	await until(() => flg3);
	await until(() => flg1);
	return id;
}
async function runScore(x) {
	await until(() => flg2);
	let v0 = parseInt(document.getElementById("pos").value), v1 = parseInt(document.getElementById("neg").value), id = `#${x}_prog`;
	$(id).progress("reset");
	$(id).progress("set total", v0 + v1);
	$(id).progress("set progress", [v0, v1]);
	$(id).progress({
		text: {
			percent: '{bar}:{percent}%',
			bars: ['正方', '反方']
		}
	});
	$(id).progress("set label", `正方：${v0} —— 反方:${v1}`);
	await until(() => flg1);
}

async function _pageBuild() {
	$('#help').sidebar({
		silent: true
	});
	$('#settings').sidebar({
		silent: true
	});
	const info = parse(data);
	for (let i in info) {
		if (info[i][1] == "tmr") {
			document.getElementById(info[i][4] + "_timer").innerText = "00:00.00";
		}
	}
	for (let i in info) {
		flg1 = false;
		activate(info[i][4], info[i][1], getcol(info[i][0]));
		if (info[i][1] == "tmr") {
			await runTimer(info[i]);
		} else {
			await runScore(info[i][4]);
		}
		deactivate(info[i][4]);
	}
}

function _showHelp() {
	$('#help').sidebar('toggle');
}

function _showSettings() {
	$('#settings').sidebar('toggle');
}

function _input() {
	for (let i in ts) {
		document.getElementById(ts[i][1] + "_title").innerText = ts[i][0] + " " + document.querySelector(`input[name='${ts[i][1]}_set']`).value;
	}
}
