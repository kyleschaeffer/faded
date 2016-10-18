// game
var game = {
    
    // configuration
    game: this,
    canvas: $('#game'),
    log: $('#log'),
    actions: $('#actions'),
    content: [],
    data: {
        bookmark: 'start',
        time: 2,
        name: 'Stranger',
        equip: {
            head: false,
            torso: false,
            arm: false,
            wrist: false,
            hand: false,
            leg: false,
            foot: false,
            back: false,
            mainhand: false,
            offhand: false
        },
        inventory: []
    },
    position: -1,
    textspeed: 1,
    textdelay: 1,
    
    // begin
    init: function(){
        
        // listen
        game.listen();
        
        // qualities
        game.qualities = {
            0: [ 'like it’s seen better days', 'like it’s been neglected for years', 'fragile, like it could break at any moment' ],
            1: [ 'solid', 'sturdy', 'well-made', 'durable' ],
            2: [ 'powerful', 'strong', 'formidable', 'fierce' ],
            3: [ 'magnificent', 'indestructable', 'amazing', 'beautiful' ],
            4: [ 'amazingly powerful', 'magnificently strong', 'fiercly indestructable', 'remarkably unique' ],
            5: [ 'like nothing else I’ve ever seen', 'like something out of a science fiction novel' ]
        };
        game.quality = function(i){
            return game.pick(game.qualities[i]);
        };
        
        // pick
        game.pick = function(array){
            return array[Math.floor((Math.random() * array.length))];
        };
        
        // items
        game.items = {
            head: {},
            torso: {},
            arm: {},
            wrist: {},
            hand: {},
            leg: {},
            foot: {},
            back: {},
            weapon: {
                rake: {
                    type: 'weapon',
                    quality: 0,
                    name: 'old rake',
                    description: 'The metal is rusty, the wood rotten.',
                    power: 1
                }
            }
        };
        
        // content
        game.content = [
            { bookmark: 'start', content: 'Cold. ', delay: 3 },
            { content: 'Damp.\n', delay: 2 },
            { content: 'Wake up, you fool. ' },
            { content: 'You can’t stay here. ' },
            {
                content: 'Get up.\n',
                color: '#fff',
                intensity: 2,
                actions: [
                    { content: 'Stand up' }
                ]
            },
            { content: 'Slowly', delay: 0.1 },
            { content: '... ', speed: 20 },
            { content: 'Standing now.\n' },
            { content: 'Where am I?\n' },
            { content: 'The darkness is thick. ' },
            { content: 'The sky clear and crisp, filled with stars. ' },
            { content: 'A new moon.\n' },
            { content: 'And cold. ' },
            { content: 'I can see my breath.\n' },
            { content: 'I’m in a small clearing. ' },
            { content: 'The ruins of a long collapsed farmhouse are piled nearby. ' },
            {
                content: 'A tiny metal shed still stands, its walls blackened by fire.\n',
                actions: [
                    { content: 'Open the shed' }
                ]
            },
            { content: 'The door opens with a deafening groan that cuts the air like a knife. ' },
            { content: 'I look around, but I’m alone.\n' },
            {
                content: 'The shed is nearly empty. Picked clean. There’s an old rake hanging on the wall.\n',
                actions: [
                    {
                        content: 'Take the rake'
                    }
                ]
            },
            { content: 'The silence screams of something', delay: 0.1 },
            { content: '...', speed: 20 },
            { content: 'ominous? ' },
            { content: 'I can’t remember.\n' },
            {
                content: 'This $ will do for now.\n',
                
                links: [
                    game.items.weapon.rake
                ]
            }
        ];
        
        // scrollto
        $('#log').data('scrollto', 0)
        
        // play
        game.next();
        
    },
    
    // next
    next: function(bookmark){
        
        // bookmark?
        if(bookmark){
            $.each(game.content, function(i, entry){
                if(entry.bookmark == bookmark){
                    game.position = i;
                    return false;
                }
            });
        }
        
        // advance
        else{
            game.position++;
        }
        
        // play
        if(game.content[game.position]){
            game.play(game.content[game.position]);
        }
        
    },
    
    // play
    play: function(options){
        
        // settings
        var settings = {
            content: '',
            color: false,
            intensity: false,
            speed: 1,
            delay: 1,
            links: false,
            actions: false
        };
        $.extend(settings, options);
        
        // new span
        game.log.append('<span/>');
        
        // color?
        if(settings.color){
            game.log.children('span:last').css('color', settings.color);
        }
        
        // intensity?
        if(settings.intensity){
            if(settings.intensity > 1){
                game.log.children('span:last').css('font-weight', 'bold');
            }
            else{
                game.log.children('span:last').css('opacity', settings.intensity);
            }
        }
        
        // timing
        var itemOffset = 0;
        $.each(settings.content.split(''), function(i, letter){
            
            // links?
            if(letter == '$' && settings.links){
                
                // get link
                var linkname = settings.links[itemOffset].name;
                var linkquality = settings.links[itemOffset].quality;
                var linkdescription = settings.links[itemOffset].description || '';
                
                // create link
                letter = $('<button class="link"/>');
                letter.append('[' + linkname + ']');
                letter.addClass('quality' + linkquality);
                
                // inspect
                letter.on('click', function(){
                    game.play({
                        content: 'The ' + linkname + ' looks ' + game.quality(linkquality) + '. ' + linkdescription + '\n'
                    });
                });
                
                // advance
                itemOffset++;
                
            }
            
            // add new content
            setTimeout(function(){
                game.log.children('span:last').append(letter);
                
                // scroll down
                var scrollTo = $('#log').get(0).scrollHeight - $('#log').height();
                if($('#log').scrollTop() < scrollTo && $('#log').data('scrollto') < scrollTo){
                    $('#log').data('scrollto', scrollTo).stop(true).animate({
                        scrollTop: scrollTo
                    }, game.textspeed * 10);
                }
                
            }, i * settings.speed * game.textspeed);
            
        });
        
        // actions
        if(settings.actions){
            $.each(settings.actions, function(i, action){
                
                // create button
                var button = $('<button>' + action.content + '</button>');
                
                // bookmark?
                if(action.bookmark){
                    $(button).on('click', function(e){
                        game.next(action.bookmark);
                    });
                }
                
                // advance
                else{
                    $(button).on('click', function(e){
                        game.next();
                    });
                }
                
                // add button
                setTimeout(function(){
                    game.actions.append(button);
                }, settings.content.length * settings.speed * game.textspeed);
                
            });
        }
        
        // continue
        else {
            setTimeout(function(){
                game.next();
            }, (settings.content.length * settings.speed * game.textspeed) + (settings.delay * game.textdelay));
        }
        
    },
    
    // listen
    listen: function(){
        $(document).on('click', '#actions button', function(e){
            $('#actions').empty();
        });
    }
    
};

// begin
game.init();