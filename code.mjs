import { Writer } from "./Writer.mjs"

const PAGES = []
let SCORE = 0
const ANSWERS = []
const SAVED_ANSWERS = []

function isSkip() {
    return SAVED_ANSWERS.length > 0
}

function recordAnswer(text) {
    text = text.toUpperCase()
    const textHash = sha256(text)
    console.log(text)
    ANSWERS.push(text)
    console.log(textHash)
    return ""
}

function shiftAnswer() {
    return recordAnswer(SAVED_ANSWERS.shift())
}

function hashAnswer(index = -1) {
    const length = ANSWERS.length
    return sha256(index >= 0 ? ANSWERS[index] : ANSWERS[length + index])
}

function addScore(points) {
    SCORE += points
    const scoreElement = document.getElementById("score")
    scoreElement.textContent = SCORE
}

function portrait(filename) {
}

function show(portraitImage, mainImage = null) {
    return async function() {
        const img = document.querySelector(".story-panel img")
        img.src = `img/${portraitImage}`
        if (mainImage) {
            const questionElement = document.querySelector(".question")
            questionElement.innerHTML = `<img src="img/${mainImage}">`
        }
        return ""
    }
}

async function write(text) {
    if (isSkip()) return false

    const story = document.querySelector(".story-text p")
    const writer = new Writer(story)
    await writer.write(text)
    return true
}

function waitNext() {
    const button = document.querySelector(".next-button")
    button.classList.remove("hidden")
    return new Promise((resolve, reject) => {
        let oneShot = null
        oneShot = function() {
            button.removeEventListener("click", oneShot)
            button.classList.add("hidden")
            resolve()
        }
        button.addEventListener("click", oneShot)
    })
}

function checkPoint(text) {
    return async function() {
        if (SCORE < ANSWERS.length) {
            await write(text)
            await waitNext()
            return false
        } else {
            localStorage.setItem("saved-answers", JSON.stringify(ANSWERS))
            return true
        }
    }
}

function noAnswer() {
    return async function() {
        if (isSkip()) return null
        await waitNext()
    }
}

function answer(html) {
    const answerElement = document.querySelector(".answer")
    answerElement.innerHTML = `<form></form>`
    const formElement = answerElement.querySelector("form")
    formElement.innerHTML = html + `
        <input type="submit" class="button" value="Submit answer">
    `

    const qaElement =document.querySelector(".question-answer")
    qaElement.classList.add("fade-in")

    return new Promise((resolve, reject) => {
        formElement.addEventListener("submit", event => {
            event.preventDefault()
            qaElement.classList.remove("fade-in")
            window.setTimeout(() => {
                resolve(formElement)
            }, 1000)
        })
    })
}

function textAnswer(prompt="", options = "") {
    return async function() {
        if (isSkip()) return shiftAnswer()

        const form = await answer(`<label>${prompt}<input type="text" ${options}></label>`)
        let text = form.querySelector("input").value
        text = text.trim().split(/\s+/).join(" ")
        return recordAnswer(text)
    }
}

function numAnswer(prompt="", options = "") {
    return async function() {
        if (isSkip()) return shiftAnswer()

        const form = await answer(`<label>${prompt}<input type="number" ${options}></label>`)
        let value = form.querySelector("input").value
        const text = Math.round(value).toString()
        return recordAnswer(text)
    }
}

function radioAnswer(options) {
    return async function() {
        if (isSkip()) return shiftAnswer()

        let html = `<ul>`
        for (let key of Object.keys(options)) {
            const text = options[key]
            html += `<li><label><input type="radio" name="opt" value="${key}">${text}</label></li>`
        }
        html += `</ul>`
        const form = await answer(html)

        let text = ""
        for (let radio of form.querySelectorAll("input[type=radio]")) {
            if (radio.checked) text = radio.value
        }
        return recordAnswer(text)
    }
}

/****************************************************************************
 ** Story                                                                  **
 ****************************************************************************/

function story() {
    PAGES.push(
        show("professor.png"),
        `
            You are a professor at SETI, the organisation dedicated to the
            search for Extra-Terrestrial Intelligence.
            You have been studying alien worlds for many years.
        `,
        `
            Your days are normally devoted to quiet observation of the sky,
            either gazing through telescopes or analysing data records.
        `,
        `
            But today, you are astonished to see a military car pull up outside.
            A military general, flanked by two assistants, comes marching up to your door.
        `,
        show("commander1.png", "q1.png"),
        `
            Professor! We need your advice!
            We have received transmissions to our military satellites.
            We suspect some may show the characteristics of alien intelligence.
        `,
        `
            These are the four most recent messages received, shown as binary.
            I think you will easily spot the mathematical pattern...
        `,
        radioAnswer({
            a1: "The first one looks like the Fibonacci sequence!",
            b1: "The second one is an encrypted message!",
            c1: "The third one looks like counting in binary!",
            d1: "The fourth one follows a quadratic equation!",
        }),
        function() {
            const hash = hashAnswer()
            if (hash === "ab861dc170dc2e43224e45278d3d31a675b9ebc34c9b0f48c066ca1eeaed8ee6") {
                addScore(1)
                return `
                    That's exactly what our analysts thought!
                    It's clear evidence that we are dealing with an advanced species!
                `
            } else {
                return `
                    That's an interesting idea, professor...
                    although it's not what we had in mind.
                `
            }
        },
        
        show("courier1.png"),
        `
            Sir! We have just received another message from the alien source...
            and it looks like they are waiting for us to reply to them!
        `,
        
        show("commander1.png", "q2.png"),
        `
            Let's see... This message also looks like a number sequence.
            I think we need to continue the pattern, if we could only work out
            what digits should come next!
        `,
        textAnswer("The next digits should be:", 'minlength="6" maxlength="6"'),
        function() {
            if (hashAnswer() === "28c5cc9f0c3cfd9d1e6a1bba44f47e520688275184e8e935d6c26f5eec2297d3") {
                addScore(1)
                return `
                    Yes, that was an obvious one!
                    But there's another more difficult sequence here...
                `
            } else {
                return `
                    Well, I guess your guess is as good as mine, professor!
                    There's one more sequence to solve here as well...
                `
            }
        },
        show("commander1.png", "q3.png"),
        textAnswer("The next digits should be:", 'minlength="4" maxlength="4"'),
        function() {
            if (hashAnswer() === "3dd9c0995d54c0abd51a90f1d57b1ce77bc885fc8a7cea52dcad3c2540dda5ee") {
                addScore(1)
                return `
                    Of course! The pattern uses prime numbers; something which
                    any intelligent species must understand.

                    Sergeant, broadcast this reply immediately!
                `
            } else {
                return `
                    That doesn't seem correct to me, professor!
                `
            }
        },
        
        checkPoint(`
            I'm sorry professor, but it doesn't seem you have the expertise we need.
            Thank-you for your time. Goodbye!
        `),
        
        show("observatory.png"),
        `
            The message is transmitted into space.
            Then there is nothing to do but wait anxiously,
            telescopes scouring for signs of activity in the night sky.
        `,
        
        `
            The peace is undistubed for several years, until one day you
            receive a phone call. The voice on the other end is familiar:
            "Professor, is that you?"
        `,
        
        show("fleet.png"),
        `
            The voice continues: 
            "We have detected an alien war fleet heading towards us...
            and they will reach Earth in barely a day!"
        `,
        
        `
            "Even at their current distance, the size of the fleet is enough
            to cover the brightest star in the night sky!"
        `,
        
        show("phone.jpg", "sms.jpg"),
        `
            "We need you to fly out to the emergency space response center.
            Get a flight tomorrow if you can. I'm sending coordinates by SMS!"
        `,
        textAnswer("The city you should fly to is:"),
        function() {
            if (hashAnswer() === "e50b8f1131e73a10e47d05c44397ebbea9695002a435162c762d0ac36981aee4") {
                addScore(1)
                return `
                    You book your plane ticket for the next morning,
                    certain that you are headed for the correct airport.
                `
            } else {
                return `
                    You book your plane ticket for the following afternoon.
                    You just hope you have the right airport!
                `
            }
        },
        
        show("chart.png", "sky.jpg"),
        `
            Meanwhile, you ponder the general's words:
            "the brightest star in the night sky".
            Suddenly, you have an idea where the aliens must come from...
        `,
        textAnswer("The aliens' home star system is:", 'minlength="3"'),
        function() {
            if (hashAnswer() === "c00cdf7c2a0c9f33702c75696678bd66f03c2d215de7b9f5a72d628972290fd2") {
                addScore(1)
                return `
                    Of course! The dog star! It's a binary star system
                    long thought to harbour alien life forms!
                    Perhaps this information will be useful later...
                `
            } else {
                return `
                    You don't feel too certain about your guess, as
                    you need to study your charts further. Still, it is
                    getting late and your are tired!
                `
            }
        },
        checkPoint(`
            You take a midday taxi to the airport,
            but by the time you arrive crowds are gathering outside.
            You realise the aeroplanes have all been grounded.
            The invasion of earth has started already, and you are too late!
        `),
        show("aeroplane.jpg"),
        `
            You take an early morning taxi to the airport, and by 11AM the plane begins
            descending towards your destination...
        `,
        `
            As you approach the runway, you become aware of another shadow cast on
            the ground by a much larger vessel... an alien ship must be directly above you!
        `,
        show("crowd.jpg", "ship.jpg"),
        `
            As soon as the plane lands, people rush to the exits. They are screaming
            and pushing each other. You almost fall onto the tarmac of the airport.
        `,
        `
            From the runway markings, you see that the shadow of the alien ship is
            40 metres long. The sun's angle of elevation is 60 degrees, so you are
            able to calculate the height of the alien vessel.
        `,
        numAnswer("The height of the vessel in metres is:"),
        function() {
            const hash = hashAnswer()
            if (hash === "c75cb66ae28d8ebc6eded002c28a8ba0d06d3a78c6b5cbf9b2ade051f0775ac4" ||
                hash === "ff5a1ae012afa5d4c889c50ad427aaf545d31a4fac04ffc1c4d03d403ba4250a") {
                addScore(1)
                return `
                    This information could be useful when planning a counter-attack
                    against the alien invaders!
                `
            } else {
                return `
                    Your answer doesn't seem correct but there is no time to check it!
                    The door of the alien ship seems to be opening!
                `
            }
        },
        show("corridor.png", "directions.jpg"),
        `
            You run to the airport terminal, trying to keep away from the frenzied mob.
            Even the security guards are running in terror, so nobody pays attention
            to you as you slip into the security corridor.
        `,
        `
            You realise this could be a good chance to find a weapon...
            but which direction should you search?
        `,
        radioAnswer({
            a2: "Straight ahead",
            b2: "In the left-hand corridor",
            b3: "In the right-hand corridor"
        }),
        function() {
            const hash = hashAnswer()
            if (hash === "abdbc2b5cc2c7a519b72bf7a164c58ebf892ab0c2df6468213705cc2f0da8561") {
                addScore(1)
                return `
                    You manage to find a cupboard full of dangerous items.
                    There are pocket knives and even a gun, but no bullets.
                    The most useful item looks to be a length of torch, which
                    you stick in your pocket.
                `
            } else {
                return `
                    You search around for a few minutes but find nothing useful.
                    A sound from outside makes you realise you are short of time.
                `
            }
        },
        checkPoint(`
            As you head out, you become aware of an acrid odour.
            You struggle to breathe and stumble to your knees,
            trying to focus on the looming shadow approaching you...
        `),
    )
}

async function playOnce() {
    for (let page of PAGES) {
        if (typeof page === "function") {
            const result = await page()
            if (result === false) return false
            
            if (result.length > 0 && !isSkip()) {
                await write(result)
                await waitNext()
            }
        } else if (typeof page === "string" && !isSkip()) {
            await write(page)
            await waitNext()
        }
    }
    return true
}

document.addEventListener("DOMContentLoaded", async () => {
    const savedAnswers = localStorage.getItem("saved-answers")
    if (savedAnswers) {
        const answers = JSON.parse(savedAnswers)
        SAVED_ANSWERS.push(...answers)
    }
    story()

    for (;;) {
        SCORE = 0
        ANSWERS.splice(0)
        await playOnce()
        await write(`
            You finished the game with a score of ${SCORE} out of ${ANSWERS.length}.
            Click the next button to try again.
        `)
        await waitNext()
    }
})

