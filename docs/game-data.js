const VERSION=3;
const rigs=[
 {n:'Browser Miner',base:15,h:1,d:'Lightweight opportunistic hashing.'},{n:'GPU Rack',base:120,h:8,d:'Parallel consumer-grade compute.'},{n:'ASIC Array',base:950,h:55,d:'Purpose-built proof engine.'},{n:'Liquid Farm',base:8200,h:360,d:'Dense cooled mining cluster.'},{n:'Substation Vault',base:72000,h:2450,d:'Industrial grid-linked facility.'},{n:'Orbital Miner',base:680000,h:17000,d:'Solar-fed autonomous platform.'},{n:'Lunar Foundry',base:7200000,h:125000,d:'Low-gravity fabrication network.'},{n:'Quantum Relay',base:84000000,h:980000,d:'Entangled nonce distribution.'},{n:'Helios Swarm',base:1.1e9,h:8.4e6,d:'Solar-scale autonomous collectors.'},{n:'Dyson Hash Ring',base:1.8e10,h:7.5e7,d:'Stellar-scale computation.'},{n:'Singularity Forge',base:3.8e11,h:7.2e8,d:'Event-horizon compute lattice.'},{n:'Causal Engine',base:1.2e13,h:8.5e9,d:'Hashes across probabilistic timelines.'}
];
const research=[
 {id:'clock',n:'Clock Tuning',c:250,d:'+25% global hash rate.',m:1.25},{id:'bus',n:'Quantum Bus',c:1400,d:'+45% global hash rate.',m:1.45},{id:'cool',n:'Cryogenic Loops',c:8500,d:'+70% global hash rate.',m:1.7},{id:'route',n:'Dark Routing',c:55000,d:'+100% global hash rate.',m:2},{id:'predict',n:'Nonce Oracle',c:380000,d:'+150% global hash rate.',m:2.5},{id:'stellar',n:'Stellar Compression',c:2800000,d:'+250% global hash rate.',m:3.5},
 {id:'mesh',n:'Adaptive Mesh',c:2.2e7,d:'+300% global hash rate.',m:4},{id:'vacuum',n:'Vacuum Logic',c:1.7e8,d:'+400% global hash rate.',m:5},{id:'causal',n:'Causal Cache',c:1.5e9,d:'+550% global hash rate.',m:6.5},{id:'chrono',n:'Chrono Scheduler',c:1.8e10,d:'+750% global hash rate.',m:8.5},{id:'exotic',n:'Exotic Matter Bus',c:2.5e11,d:'+1000% global hash rate.',m:11},{id:'omega',n:'Omega Consensus',c:4e12,d:'+1500% global hash rate.',m:16}
];
const pools=[
 {id:'solo',n:'Solo Relay',d:'Balanced autonomous mining.',hash:1,manual:1,crit:0,contract:1,perk:'No penalties. Reliable baseline.'},
 {id:'nova',n:'Nova Cooperative',d:'High-throughput shared network.',hash:1.35,manual:.85,crit:0,contract:1.15,perk:'+35% passive hash, +15% contract progress.'},
 {id:'ghost',n:'Ghost Pool',d:'Aggressive low-latency routing.',hash:.92,manual:1.55,crit:.08,contract:1,perk:'+55% manual output, +8% crit chance.'},
 {id:'atlas',n:'Atlas Syndicate',d:'Enterprise contracts and stability.',hash:1.12,manual:1,crit:.02,contract:1.5,perk:'+50% contract progress, +12% passive hash.'}
];
const shardUpgrades=[
 {id:'shardHash',n:'Persistent Clock',d:'+18% all hash per level.',base:2,max:15},{id:'shardManual',n:'Muscle Memory',d:'+30% active mining per level.',base:2,max:12},{id:'shardCrit',n:'Entropy Bias',d:'+1.5% critical chance per level.',base:3,max:10},{id:'shardOffline',n:'Cold Storage',d:'+20% offline earnings per level.',base:3,max:8},{id:'shardContracts',n:'Priority Routing',d:'+20% contract rewards per level.',base:4,max:8},{id:'shardAuto',n:'Autonomous Treasury',d:'Unlock smarter autobuy behavior.',base:6,max:5}
];
const genesisUpgrades=[
 {id:'genHash',n:'Prime Seed',d:'+60% all output per level.',base:1,max:12},{id:'genShard',n:'Fork Memory',d:'+35% shard gain per level.',base:1,max:10},{id:'genContract',n:'Sovereign Network',d:'+50% contract rewards per level.',base:2,max:8},{id:'genStart',n:'Bootstrap Capital',d:'Start runs with credits and early rigs.',base:2,max:6},{id:'genTime',n:'Temporal Cache',d:'+1h offline cap per level.',base:2,max:6},{id:'genOverdrive',n:'Nova Capacitor',d:'+20% Overdrive power per level.',base:3,max:8}
];
const automation=[
 {id:'autoBuy',n:'Smart Autobuy',d:'Automatically buys the best payback rig every 2s.',req:25},{id:'autoOD',n:'Auto Overdrive',d:'Automatically fires Overdrive at full charge.',req:60},{id:'autoContracts',n:'Contract Broker',d:'Automatically claims completed contracts.',req:120}
];
const milestones=[
 {n:'First Rack',req:10,m:1.05},{n:'Data Center',req:50,m:1.10},{n:'Industrial Scale',req:150,m:1.20},{n:'Orbital Economy',req:400,m:1.35},{n:'Post-Planetary',req:900,m:1.60},{n:'Stellar Civilization',req:1800,m:2.0}
];
const defaults={version:VERSION,credits:0,total:0,runEarned:0,rigs:Array(rigs.length).fill(0),research:[],shards:0,keys:0,shardLevels:{},genLevels:{},automation:[],pool:'solo',combo:0,bestCombo:0,comboAt:0,od:0,odUntil:0,rep:0,contractsDone:0,contracts:[],contractEpoch:0,last:Date.now(),runStarted:Date.now(),forks:0,genesis:0,events:[]};
