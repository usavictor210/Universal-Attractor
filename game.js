﻿player={playtime:0,
points:new Decimal(10),
totalPoints:new Decimal(0),
lastUpdate:0,
generators:{t1:{amount:new Decimal(0),bought:0},
t2:{amount:new Decimal(0),bought:0},
t3:{amount:new Decimal(0),bought:0},
t4:{amount:new Decimal(0),bought:0},
t5:{amount:new Decimal(0),bought:0},
t6:{amount:new Decimal(0),bought:0},
t7:{amount:new Decimal(0),bought:0},
t8:{amount:new Decimal(0),bought:0},
t9:{amount:new Decimal(0),bought:0},
t10:0},
prestiges:[0,0],
prestigePeak:[new Decimal(1),new Decimal(0)],
prestigeUpgrades:[],
prestigePower:new Decimal(1),
prestigePoints:new Decimal(0),
scientific:false}
tab='generators'
tierCosts=[]
resetting=false

function abbreviation(label,step) {
	var haListU = ['U','D','T','Q','Qi','S','Sp','O','N']
	var haListT = ['D','V','T','Q','Qi','S','Sp','O','N']
	var haListH = ['C','Dn','Tn','Qn','Qin','Sn','Spn','On','Nn']
	abb=''
	if (label==0) {
		return 'k'
	}
	if (label==1) {
		return 'M'
	}
	if (label>=2000) {
		abb+=abbreviation(Math.floor(label/1000),step+1)
	}
	if (Math.floor(label/1000)%1000!=0) {
		var haListP = ['Mi','Mc','Na','Pc','Ft','At','Zp','Yc','Xn','Dk',
		'MiDk','McDk','NaDk','PcDk','FtDk','AtDk','ZpDk','YcDk','XnDk','Is',
		'MiIs','McIs','NaIs','PcIs','FtIs','AtIs','ZpIs','YcIs','XnIs','Tc',
		'MiTc','McTc','NaTc','PcTc','FtTc','AtTc','ZpTc','YcTc','XnTc','tc',
		'Mitc','Mctc','Natc','Pctc','Fttc','Attc','Zptc','Yctc','Xntc','Pc',
		'MiPc','McPc','NaPc','PcPc','FtPc','AtPc','ZpPc','YcPc','XnPc','Hc',
		'MiHc','McHc','NaHc','PcHc','FtHc','AtHc','ZpHc','YcHc','XnHc','hc',
		'Mihc','Mchc','Nahc','Pchc','Fthc','Athc','Zphc','Ychc','Xnhc','Oc',
		'MiOc','McOc','NaOc','PcOc','FtOc','AtOc','ZpOc','YcOc','XnOc','Nc',
		'MiNc','McNc','NaNc','PcNc','FtNc','AtNc','ZpNc','YcNc','XnNc','Ht','MiHt','McHt']
		abb+=haListP[step-1]
	}
	if (label%10!=0) {
		if (label%100==2) {
			abb+='B'
		} else {
			abb+=haListU[label%10-1]
		}	
	}
	if (Math.floor(label/10)%10!=0) {
		abb+=haListT[Math.floor(label/10)%10-1]
		if (Math.floor(label)%10==0 && Math.floor(label/10)%10 != 1) {
			abb+='g'
		}
	}
	if (Math.floor(label/100)%10!=0) {
		abb+=haListH[Math.floor(label/100)%10-1]
	}
	return abb
}

function letter(label) {
	var letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
	var result=''
	do {
		result=letters[BigInteger.remainder(BigInteger.subtract(label,1),26)]+result
		label=BigInteger.divide(BigInteger.subtract(label,1),26)
	} while (label>0)
	return result
}

function format(number) {
	if (number.e>=Number.MAX_VALUE & number.neq(0)) {
		return 'Infinite'
	} else if (player.scientific && (number.gte(1000) || number.eq(1000))) {
		return number.div(Decimal.pow(10,number.e)).toPrecision(3).toString()+'e'+number.e
	} else if (number.gte(1e306) || number.eq(1e306)) {
		var label = BigInteger.divide(number.e,3)
		return number.div(Decimal.pow(1000,label)).toPrecision(3).toString()+letter(label)
	} else if (number.gte(1000) || number.eq(1000)) {
		var label = BigInteger.divide(number.e,3)
		return number.div(Decimal.pow(1000,label)).toPrecision(3).toString()+abbreviation(BigInteger.subtract(label,1))
	} else {
		return number.toFixed(0).toString()
	}
}

function updateGeneratorCosts() {
	for (i = 1; i < 10; i++) { 
		tierCosts[i-1]=new Decimal.times(10**(i*(0.9+0.1*i)),new Decimal.pow(1.5,player.generators['t'+i].bought*(0.1+(i*0.9))))
	}
	tierCosts[9]=new Decimal.times(10**19,new Decimal.pow(1.5,player.generators.t10*9.1))
}

function buyGenerator(tier, bulk=1) {
	if (player.points.gte(tierCosts[tier-1])) {
		var baseMultiplier = 1.5**(0.1+tier*0.9)
		var maxBulk=new Decimal.div(player.points,baseMultiplier/(baseMultiplier-1)).div(tierCosts[tier-1]).add(1).e/Math.log10(baseMultiplier)
		if (bulk>maxBulk) {
			bulk=maxBulk
		}
		if (bulk==0) {
			bulk=1
		}
		var nextN=bulk-1
		var totalCost=tierCosts[tier-1]
		var prevTC
		if (bulk>1) {
			do {
				prevTC=totalCost
                if (tier==10 && player.prestigeUpgrades.includes(6) && player.generators.t10 >= 15) totalCost = totalCost.plus(tierCosts[9].times(Decimal.pow(1.5,7*nextN)))
				else totalCost=totalCost.add(tierCosts[tier-1].times(Decimal.pow(1.5,(0.1+(tier*0.9))*nextN)))
				nextN-=1
			} while (!totalCost.eq(prevTC) && nextN>0)
		}
		if (!player.points.gte(totalCost)) {
			bulk-=1
            if (tier==10 && player.prestigeUpgrades.includes(6) && player.generators.t10 >= 15) totalCost = totalCost.sub(tierCosts[9].times(Decimal.pow(1.5,7*bulk)))
			else totalCost=totalCost.sub(tierCosts[tier-1].times(Decimal.pow(1.5,(0.1+(tier*0.9))*bulk)))
		}
		player.points=player.points.sub(totalCost)
		if (tier == 10) {
			player.generators.t10+=bulk
		} else {
			player.generators['t'+tier].amount=player.generators['t'+tier].amount.add(bulk)
			player.generators['t'+tier].bought+=bulk
		}
		updateGeneratorCosts()
	}
}

function maxAll() {
	buyGenerator(1,Infinity)
	buyGenerator(2,Infinity)
	buyGenerator(3,Infinity)
	buyGenerator(4,Infinity)
	buyGenerator(5,Infinity)
	buyGenerator(6,Infinity)
	buyGenerator(7,Infinity)
	buyGenerator(8,Infinity)
	buyGenerator(9,Infinity)
	buyGenerator(10,Infinity)
}

function getGeneratorMultiplier(tier) {
	var multi=new Decimal(1)
	if (tier == 10) {
		multi=multi.times(Decimal.pow(player.prestigeUpgrades.includes(10) ? 1.04 : 1.03,player.generators.t10))
	} else {
		multi=multi.times(Decimal.pow(1.03,player.generators['t'+tier].bought))
	}
	multi=multi.times(player.prestigePower)
    if (player.prestigeUpgrades.includes(1) && (tier<=9 || player.generators.t10>0)) multi = multi.times(new Decimal.pow(1.01,Math.min((tier == 10)? Math.floor(Math.log10(player.generators.t10)) : (player.generators['t'+tier].amount.gt(1)) ? player.generators['t'+tier].amount.e : 0,50)))
    if (player.prestigeUpgrades.includes(2)) multi = multi.times((player.playtime/86400000+1)**1.1)
    if (player.prestigeUpgrades.includes(3) && player.prestigePeak[0].gt(1)) multi = multi.times(player.prestigePeak[0].log10()/5+1)
    if (player.prestigeUpgrades.includes(4) && player.prestigePeak[1].gt(1)) multi = multi.times(player.prestigePeak[1].log10()/10+1)
    if (player.prestigeUpgrades.includes(11)) multi = multi.times(2)
    
	return multi
}
   
function updatePrestigeUpgrades() {
	var upgradesBought=0
	for (i=1;i<=12;i++) {
		if (player.prestigeUpgrades.includes(i)) {
			upgradesBought++
			document.getElementById('pt2shop'+i).className='ptShopBought'
		} else {
			document.getElementById('pt2shop'+i).className='ptShopButton'
		}
	}
	if (upgradesBought==13) {
		document.getElementById('pt2shop13').className='ptShopBought'
	} else if (upgradesBought==12) {
		document.getElementById('pt2shop13').className='ptShopButton'
	} else {
		document.getElementById('pt2shop13').className='ptShopLocked'
	}
}

function buyUpgrade(tier) {
	for (i=1;i<=12;i++) {
		if (player.prestigeUpgrades.includes(i)) {
			upgradesBought++
		}
	}
    if (!player.prestigeUpgrades.includes(tier) && player.prestigePoints.gte(Decimal.pow(2,tier-1)) && (tier<13 || upgradesBought==12)) {
        player.prestigePoints = player.prestigePoints.minus(Decimal.pow(2,tier-1))
        player.prestigeUpgrades.push(tier)
		updatePrestigeUpgrades()
    }
}

function getPrestigePower() {
	multi=player.points.div(5.7e26).pow(0.075)
    if (player.prestigeUpgrades.includes(5) && player.prestigePower.log10()>1) multi=multi.times(multi.log10())
    if (player.prestigeUpgrades.includes(9)) multi=multi.times(2)
	return multi
}

function getPrestigePoints() {
    if (player.prestigeUpgrades.includes(13)) return player.prestigePower.div(100000).cbrt().floor()
	return player.prestigePower.div(1000000).cbrt().floor()
}

function save() {
	localStorage.setItem('save',btoa(JSON.stringify(player)))
}

function load() {
	try {
		savefile=JSON.parse(atob(localStorage.getItem('save')))
		savefile.points=new Decimal(savefile.points)
		savefile.generators.t1.amount=new Decimal(savefile.generators.t1.amount)
		savefile.generators.t2.amount=new Decimal(savefile.generators.t2.amount)
		savefile.generators.t3.amount=new Decimal(savefile.generators.t3.amount)
		savefile.generators.t4.amount=new Decimal(savefile.generators.t4.amount)
		savefile.generators.t5.amount=new Decimal(savefile.generators.t5.amount)
		savefile.generators.t6.amount=new Decimal(savefile.generators.t6.amount)
		savefile.generators.t7.amount=new Decimal(savefile.generators.t7.amount)
		savefile.generators.t8.amount=new Decimal(savefile.generators.t8.amount)
		savefile.generators.t9.amount=new Decimal(savefile.generators.t9.amount)
		if (savefile.prestigePower!=undefined) {
			savefile.prestigePower=new Decimal(savefile.prestigePower)
			savefile.prestigePoints=new Decimal(savefile.prestigePoints)
		} else {
			savefile.prestigePower=new Decimal(1)
			savefile.prestigePoints=new Decimal(0)
		}
		if (player.playtime!=undefined) {
			savefile.totalPoints=new Decimal(savefile.totalPoints)
		} else {
			player.playtime=0
			savefile.prestiges=[0,0]
			savefile.totalPoints=new Decimal(0)
		}
		if (savefile.scientific==undefined) {
			savefile.scientific=false
		}
        if (savefile.prestiges != undefined) savefile.prestigePeak = [new Decimal(savefile.prestigePeak[0]),new Decimal(savefile.prestigePeak[1])]
        else {
            savefile.prestiges = []
            savefile.prestigePeak = [savefile.prestigePower,savefile.prestigePoints]
        }
		player=savefile
		updateGeneratorCosts()
	} catch(err) {
		console.log('Your save failed to load:\n'+err)
		localStorage.clear('save')
	}
}

function exportSave() {
	document.getElementById("exportSave").style.display='inline-block'
	document.getElementById("exportText").value=btoa(JSON.stringify(player))
}

function importSave() {
	saveFile=prompt('Copy and paste in your exported file and press enter.')
	try {
		savefile.points=new Decimal(savefile.points)
		savefile.generators.t1.amount=new Decimal(savefile.generators.t1.amount)
		savefile.generators.t2.amount=new Decimal(savefile.generators.t2.amount)
		savefile.generators.t3.amount=new Decimal(savefile.generators.t3.amount)
		savefile.generators.t4.amount=new Decimal(savefile.generators.t4.amount)
		savefile.generators.t5.amount=new Decimal(savefile.generators.t5.amount)
		savefile.generators.t6.amount=new Decimal(savefile.generators.t6.amount)
		savefile.generators.t7.amount=new Decimal(savefile.generators.t7.amount)
		savefile.generators.t8.amount=new Decimal(savefile.generators.t8.amount)
		savefile.generators.t9.amount=new Decimal(savefile.generators.t9.amount)
		if (savefile.prestigePower!=undefined) {
			savefile.prestigePower=new Decimal(savefile.prestigePower)
			savefile.prestigePoints=new Decimal(savefile.prestigePoints)
		} else {
			savefile.prestigePower=new Decimal(1)
			savefile.prestigePoints=new Decimal(0)
		}
		if (player.playtime!=undefined) {
			savefile.totalPoints=new Decimal(savefile.totalPoints)
		} else {
			player.playtime=0
			savefile.prestiges=[0,0]
			savefile.totalPoints=new Decimal(0)
		}
		if (savefile.scientific==undefined) {
			savefile.scientific=false
		}
        if (savefile.prestiges != undefined) savefile.prestigePeak = [new Decimal(savefile.prestigePeak[0]),new Decimal(savefile.prestigePeak[1])]
        else {
            savefile.prestiges = []
            savefile.prestigePeak = [savefile.prestigePower,savefile.prestigePoints]
        }
		player=savefile
		updateGeneratorCosts()
		updatePrestigeUpgrades()
	} catch(err) {
		alert('Your import save was invalid or failed.')
	}
}

function switchTab(newTab) {
	document.getElementById('generatorsTab').style.display='none'
	document.getElementById('optionsTab').style.display='none'
	document.getElementById('statsTab').style.display='none'
	document.getElementById('achievementsTab').style.display='none'
	document.getElementById('prestigeTab').style.display='none'
	
	document.getElementById(newTab+'Tab').style.display='inline-block'
	tab=newTab
}

function switchNotation(tab) {
	player.scientific=(!player.scientific)
}

function formatValue(ms) {
	if (ms < 999) {
		return ms+'ms'
	} else if (ms < 59999) {
		return Math.floor(ms/10)/100+' seconds'
	} else if (ms < 3599999) {
		return Math.floor(ms/60000)+' minutes, '+Math.floor(ms/1000)%60+' seconds'
	} else if (ms < 86399999) {
		return Math.floor(ms/3600000)+' hours, '+Math.floor(ms/60000)%60+' minutes, '+Math.floor(ms/1000)%60+' seconds'
	} else {
		return Math.floor(ms/86400000)+' days, '+Math.floor(ms/3600000)%10+' hours, '+Math.floor(ms/60000)%60+' minutes, '+Math.floor(ms/1000)%60+' seconds'
	}
}

function reset(tier) {
	if (tier==Infinity?confirm('Are you really sure to reset? You will lose everything you have!'):true) {
		resetting=true
		if (tier==Infinity) {
			//Hard reset
			localStorage.clear('save')
			player.playtime=0
			player.totalPoints=new Decimal(0)
			player.prestigePeak=[new Decimal(0),new Decimal(0)]
			player.scientific=0
		}
		if (tier>=2) {
			//Transfer
			player.prestigePoints=(tier==2)? player.prestigePoints.add(getPrestigePoints()) : new Decimal(0)
			player.prestigeUpgrades=(tier==2)? player.prestigeUpgrades : []
			player.prestiges[1]=(tier==2)? player.prestiges[1]+1 : 0
			player.prestigePeak[1]=(tier==Infinity)? new Decimal(0) : (player.prestigePoints.gte(player.prestigePeak[1]))? player.prestigePoints : player.prestigePeak[1]
		}
		//Prestige
		player.prestigePower=(tier==1)? getPrestigePower() : new Decimal(1)
		player.points=(player.prestigeUpgrades.includes(7) && player.prestigePeak[1].gte(10))? player.prestigePeak[1] : new Decimal(10)
		player.generators={t1:{amount:new Decimal(0),bought:0},
		t2:{amount:new Decimal(0),bought:0},
		t3:{amount:new Decimal(0),bought:0},
		t4:{amount:new Decimal(0),bought:0},
		t5:{amount:new Decimal(0),bought:0},
		t6:{amount:new Decimal(0),bought:0},
		t7:{amount:new Decimal(0),bought:0},
		t8:{amount:new Decimal(0),bought:0},
		t9:{amount:new Decimal(0),bought:0},
		t10:0}
		player.prestiges[0]=(tier==1)? player.prestiges[0]+1 : 0
		player.prestigePeak[0]=(tier==Infinity)? new Decimal(0) : (player.prestigePower.gte(player.prestigePeak[0]))? player.prestigePower : player.prestigePeak[0]
		
		updateGeneratorCosts()
		updatePrestigeUpgrades()
		resetting=false
	}
}

setTimeout(function(){
load()
updateGeneratorCosts()
updatePrestigeUpgrades()
switchTab('generators')
setInterval(function(){
	date=new Date()
	time=date.getTime()
	if (!resetting) {
		if (player.lastUpdate > 0) {
			player.points=player.points.add(player.generators.t1.amount.mul((time-player.lastUpdate)/1000).mul(getGeneratorMultiplier(1)))
			player.totalPoints=player.totalPoints.add(player.generators.t1.amount.mul((time-player.lastUpdate)/1000).mul(getGeneratorMultiplier(1)))
			for (i = 1; i < 9; i++) { 
				player.generators['t'+i].amount=player.generators['t'+i].amount.add(player.generators['t'+(i+1)].amount.mul((time-player.lastUpdate)/1000).mul(getGeneratorMultiplier(i+1)))
			}
			player.generators.t9.amount=player.generators.t9.amount.add(new Decimal(player.generators.t10*(time-player.lastUpdate)/1000).mul(getGeneratorMultiplier(10)))
			player.playtime+=time-player.lastUpdate
		}
		player.lastUpdate=time
	}
	
	document.getElementById("points").innerHTML=format(player.points)+' stars'
	document.getElementById("pPS").innerHTML=format(player.generators.t1.amount.mul(getGeneratorMultiplier(1)))+' stars per second'
	if (tab='generators') {
		for (i = 1; i < 10; i++) { 
			document.getElementById("shop"+i).innerHTML='T'+i+' Generator x'+format(player.generators['t'+i].amount)+'<br>'+format(new Decimal(player.generators['t'+i].bought))+' bought<br>Cost: '+format(tierCosts[i-1])
		}
		document.getElementById("shop10").innerHTML='T10 Generator x'+format(new Decimal(player.generators.t10))+'<br><br>Cost: '+format(tierCosts[9])
		if (getPrestigePower().gt(player.prestigePower)) {
			document.getElementById("pt1").style.display='inline-block'
			document.getElementById("pt1").innerHTML='Prestige now to get boost for all production<br><br>Current: '+format(player.prestigePower)+'x<br>After: '+format(getPrestigePower())+'x<br>'
		} else {
			document.getElementById("pt1").style.display='none'
		}
		if (player.prestigePower.gt(1)) {
			document.getElementById("pt1stats").style.display='inline-block'
			document.getElementById("pt1stats").innerHTML='You have '+format(player.prestigePower)+'x prestige power for all production.<br>'
		} else {
			document.getElementById("pt1stats").style.display='none'
		}
		if (getPrestigePoints().gte(1)) {
			document.getElementById("pt2").style.display='inline-block'
			document.getElementById("pt2").innerHTML='Transfer your power to get prestige points.<br>+'+format(getPrestigePoints())+' PP.<br>'
		} else {
			document.getElementById("pt2").style.display='none'
		}
		if (player.prestiges[1]>0 || player.prestigePoints.gt(0)) {
			document.getElementById("pt2stats").style.display='inline-block'
			document.getElementById("pt2stats").innerHTML='You have '+format(player.prestigePoints)+' prestige points.'
		} else {
			document.getElementById("pt2stats").style.display='none'
		}
	}
	if (tab='options') {
		if (player.scientific) {
			document.getElementById("scientificOption").innerHTML='Scientific on'	
		} else {
			document.getElementById("scientificOption").innerHTML='Scientific off'	
		}
	}
	if (tab='stats') {
		document.getElementById("statsPlaytime").innerHTML='You have played for '+formatValue(player.playtime)+'.'
		document.getElementById("statsTotal").innerHTML='You have gained '+format(player.totalPoints)+' stars in total.'
		document.getElementById("statsPrestige").innerHTML='You have prestige '+player.prestiges[0]+' times.'
		document.getElementById("statsTransfer").innerHTML='You have transferred '+player.prestiges[1]+' times.'
	}
	if (tab='prestige') {
		document.getElementById("pt2stats2").innerHTML='You have '+format(player.prestigePoints)+' prestige points.'
	}
	if (player.prestiges[1]>0 || player.prestigePoints.gt(0)) {
		document.getElementById("prestigeTabButton").style.display='inline-block'
	} else {
		document.getElementById("prestigeTabButton").style.display='none'
	}
},50)

setInterval(function(){
	save()
},60000)
},10)
