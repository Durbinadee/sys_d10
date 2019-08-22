on("change:graphic", function(obj) {
  log("Heard change for object ID: "  +getAttrByName(obj.get("represents"), "Life_Points"));
  if (obj.get("isdrawing")) {
            return;
        }

        var HP = {
            now: parseInt(obj.get(CurrentHPLocation),10)  || 0,
            old: parseInt(prev[CurrentHPLocation],10)     || 0,
            max: parseInt(obj.get(MaxHPLocation),10)    || 0,
            tmp: 0
        },
        tmpHPInAttr = false,
        tmpHPAttr,
        target     = {};

        if (0 === HP.max) {
            return;
        }

        if(obj.get(TempHitPointsIn)) {
            HP.tmp = parseInt(obj.get(TempHitPointsIn),10) || 0;
        } else if(obj.get('represents')) {
            tmpHPInAttr = true;
            tmpHPAttr = findObjs({_type: 'attribute', _characterid: obj.get('represents'), name: TempHitPointsIn})[0];
            if(tmpHPAttr) {
               HP.tmp = parseInt(tmpHPAttr.get('current'),10) || 0;
            }
        }

        HP.bloodied = Math.floor(HP.max/2) || 0;
        HP.dead = -HP.bloodied;
        HP.delta = HP.now-HP.old;
        HP.healed = (HP.delta > 0);
        HP.hurt   = (HP.delta <0);

        if ( 0 !== HP.delta ) {
            if (HP.tmp && (HP.delta < 0 )) {
                target[TempHitPointsIn] = Math.max( HP.tmp + HP.delta, 0 );
                HP.delta = Math.min( HP.delta + HP.tmp, 0 );
                target[CurrentHPLocation] = Math.min( HP.old + HP.delta, HP.max );
                HP.now = target[CurrentHPLocation];
                HP.tmp = target[TempHitPointsIn];
            } else if (HP.now > HP.max) {
                HP.now=HP.max;
                target[CurrentHPLocation]=HP.max;
            } else if( ASSUME_HEALS && HP.old < 0 && (HP.delta > 0)) {
                HP.now=Math.min( HP.delta, HP.max );
                target[CurrentHPLocation]=HP.now;
            }

            if ( HP.now <= HP.dead ) {
                HP.now=HP.dead;
                target[CurrentHPLocation]=HP.dead;
                target['status_'+DeadMarker]=true;
            } else {
                target['status_'+DeadMarker]=false;
            }

            if ( HP.now <= 0 && HP.now > HP.dead ) {
                target['status_'+DyingMarker]=true;
            } else {
                target['status_'+DyingMarker]=false;
            }

            if ( HP.now <= HP.bloodied && HP.now > HP.dead ) {
                target['status_'+BloodiedMarker]=true;
            } else {
                target['status_'+BloodiedMarker]=false;
            }
            if(tmpHPInAttr) {
                if(tmpHPAttr && undefined !== target[TempHitPointsIn] ) {
                   tmpHPAttr.set({current: (target[TempHitPointsIn] || 0)});
                }
                delete target[TempHitPointsIn];
            }
            obj.set(target);
          }
    }
});
