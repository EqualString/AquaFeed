/** Iscrtavanje mjehurića pomoću Raphaela i Vanilla JS-a **/

(function() {
    var paper, circs, i, nowX, nowY, timer, props = {}, dx, dy, rad, cur, opa;
    // Random integer između min i max   
    function ran(min, max)  
    {  
        return Math.floor(Math.random() * (max - min + 1)) + min;  
    } 
    
    function moveIt()
    {
        for(i = 0; i < circs.length; ++i)
        {            
              // Reset na time = 0
            if (! circs[i].time) 
            {
                circs[i].time  = ran(30, 100);
                circs[i].deg   = ran(-179, 180);
                circs[i].vel   = ran(1, 5);  
                circs[i].curve = ran(0, 1);
                circs[i].fade  = ran(0, 1);
                circs[i].grow  = ran(-2, 2); 
            }                
                // Dohvaćanje pozicije
            nowX = circs[i].attr("cx");
            nowY = circs[i].attr("cy");   
				// Računanje kretnji
            dx = circs[i].vel * Math.cos(circs[i].deg * Math.PI/180);
            dy = circs[i].vel * Math.sin(circs[i].deg * Math.PI/180);
                // Računanje nove pozicije
            nowX += dx;
            nowY += dy;
			var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
			var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                
            if (nowX < 0) nowX = (w - 20) + nowX;
            else          nowX = nowX % (w - 20);            
            if (nowY < 0) nowY = (h - 20) + nowY;
            else          nowY = nowY % (h - 20);
            
                // Render kretajućeg kruga
            circs[i].attr({cx: nowX, cy: nowY});
            
                // Veličina
            rad = circs[i].attr("r");
            if (circs[i].grow > 0) circs[i].attr("r", Math.min(30, rad +  .1));
            else                   circs[i].attr("r", Math.max(10,  rad -  .1));
            
                
            if (circs[i].curve > 0) circs[i].deg = circs[i].deg + 2;
            else                    circs[i].deg = circs[i].deg - 2;
            
                // Opacity
            opa = circs[i].attr("fill-opacity");
            if (circs[i].fade > 0) {
                circs[i].attr("fill-opacity", Math.max(.3, opa -  .01));
                circs[i].attr("stroke-opacity", Math.max(.3, opa -  .01)); }
            else {
                circs[i].attr("fill-opacity", Math.min(1, opa +  .01));
                circs[i].attr("stroke-opacity", Math.min(1, opa +  .01)); }

            // Progress timer 
            circs[i].time = circs[i].time - 1;
            
                // Calc damping
            if (circs[i].vel < 1) circs[i].time = 0;
            else circs[i].vel = circs[i].vel - .05;              
       
        } 
        timer = setTimeout(moveIt, 65); //Timer za kretnju svakog od mjehurića
    }
    
    window.onload = function () {
		//Viewport DOM-a
		var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		//Raphael inicijalizacija na canavasu
        paper = new Raphael("canavas", w, h); //Cijeli viewport
        circs = paper.set();
        for (i = 0; i < 30; ++i) //30 -> 'mjehurića'
        {
            opa = ran(3,10)/10; //Opacity
            circs.push(paper.circle(ran(0,w), ran(0,h), ran(19,(h/12))).attr({"fill-opacity": opa,
                                                                           "stroke-opacity": opa}));
        }
        circs.attr({fill: "#33B5E5", stroke: "#33B5E5"}); //Bojanje
        moveIt(); //Kretnje
    };
}());