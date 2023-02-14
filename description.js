// Random

function uniformFromList(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function makeFakeRand(indices) {
    return (function (list) {
        let idx = indices[0];
        indices = indices.slice(1);
        return list[idx];
    });
}

// Budget

function optionsMatchingBudget(budget, options) {
	return options.filter(option => option.cost === budget);
}

// Shading

patterns = ["smooth", "speckled", "pinstripe", "dappled", "checkered", "wavy", "fuzzy"];
if ((new URLSearchParams(window.location.search).get("shadeWith")||"").startsWith('c')) {
    patterns = ["white", "black", "red", "green", "blue", "yellow", "purple", "orange", "teal", "pink", "grey", "brown"];
}

// Generate stuff!

// The `budget` tracking is actually never used, only the `cost` field.

simpleShapes = ["square", "circle", "pentagon", "diamond", "cross", "hexagon", "star"];
simpleShape = {
    cost: 1,
    generate: (budget, rand) => "a " + rand(patterns) + " " + rand(simpleShapes),
}

orientableShapes = ["triangle", "semicircle", "arrow", "teardrop", "chevron"];
orientations = ["upward", "downward", "to the left", "to the right", "to the top-left", "to the top-right", "to the bottom-left", "to the bottom-right"];
orientableShape = {
    cost: 1,
    generate: (budget, rand) => "a " + rand(patterns) + " " + rand(orientableShapes) + " facing " + rand(orientations),
}

simple2dRelations = [" above ", " below ", " to the left of ", " to the right of "];
function twoDifferent(obj) {
    return {
        cost: obj.cost * 2,
        generate: (budget, rand) => obj.generate(budget / 2, rand) + rand(simple2dRelations) + obj.generate(budget / 2, rand),
    };
}

function and(obj0, obj1) {
    return {
        cost: obj0.cost + obj1.cost,
        generate: (budget, rand) => obj0.generate(budget - obj1.cost, rand) + rand(simple2dRelations) + obj1.generate(budget - obj0.cost, rand),
    };
}

numbersInRow = ["two of ", "three of ", "four of "];
rowDirections = ["vertical", "horizontal", "downwards diagonal", "upwards diagonal"]
function rowOf(obj) {
    return {
        cost: obj.cost + 1,
        generate: (budget, rand) => rand(numbersInRow) + obj.generate(budget - 1, rand) + " in a " + rand(rowDirections) + " row",
    }
}

function containing(outer, inner) {
    return {
        cost: outer.cost + inner.cost,
        generate: (budget, rand) => outer.generate(budget - inner.cost, rand) + " containing " + inner.generate(budget - outer.cost, rand),
    };
}

function overlapping(top, bottom) {
    return {
        cost: top.cost + bottom.cost,
        generate: (budget, rand) => top.generate(budget - bottom.cost, rand) + " overlapping " + bottom.generate(budget - top.cost, rand),
    };
}

// I was originally planning to use a complicated context-free grammar with
// additional budget tracking, but that turned out to not be necessary.
// It's acceptable to just list out a reasonable set of options.
options = [
   	simpleShape,
	orientableShape,
	twoDifferent(simpleShape),
	twoDifferent(orientableShape),
	and(simpleShape, orientableShape),
	rowOf(simpleShape),
	rowOf(orientableShape),
	containing(simpleShape, simpleShape),
	containing(simpleShape, orientableShape),
	containing(simpleShape, containing(simpleShape, simpleShape)),
	containing(simpleShape, containing(simpleShape, orientableShape)),
	containing(simpleShape, overlapping(simpleShape, simpleShape)),
	containing(simpleShape, overlapping(simpleShape, orientableShape)),
	containing(simpleShape, and(simpleShape, orientableShape)),
	containing(simpleShape, twoDifferent(simpleShape)),
	containing(simpleShape, twoDifferent(orientableShape)),
	overlapping(simpleShape, simpleShape),
	overlapping(simpleShape, orientableShape),
	overlapping(orientableShape, simpleShape),
	overlapping(orientableShape, orientableShape),
	twoDifferent(containing(simpleShape, simpleShape)),
	and(containing(simpleShape, simpleShape), containing(simpleShape, orientableShape)),
	and(containing(simpleShape, simpleShape), simpleShape),
	and(containing(simpleShape, simpleShape), orientableShape),
	and(containing(simpleShape, simpleShape), overlapping(simpleShape, orientableShape)),
	twoDifferent(containing(simpleShape, orientableShape)),
	twoDifferent(containing(simpleShape, containing(simpleShape, simpleShape))),
	and(containing(simpleShape, containing(simpleShape, simpleShape)),containing(simpleShape, containing(simpleShape, orientableShape))),
	rowOf(containing(simpleShape, orientableShape)),
	rowOf(containing(simpleShape, simpleShape)),
	rowOf(overlapping(simpleShape, simpleShape)),
	rowOf(overlapping(simpleShape, orientableShape)),
	rowOf(overlapping(orientableShape, simpleShape)),
	rowOf(overlapping(orientableShape, orientableShape)),
	containing(simpleShape, rowOf(simpleShape)),
	containing(simpleShape, rowOf(orientableShape)),
	overlapping(simpleShape, rowOf(simpleShape)),
	overlapping(simpleShape, rowOf(orientableShape)),
	overlapping(orientableShape, rowOf(simpleShape)),
	overlapping(orientableShape, rowOf(orientableShape)),
	twoDifferent(rowOf(simpleShape)),
	and(rowOf(simpleShape), orientableShape),
	and(rowOf(simpleShape), rowOf(orientableShape)),
	and(rowOf(simpleShape), simpleShape),
	and(rowOf(simpleShape), containing(simpleShape, simpleShape)),
	and(rowOf(simpleShape), containing(simpleShape, orientableShape)),
	and(rowOf(simpleShape), overlapping(simpleShape, simpleShape)),
	and(rowOf(simpleShape), overlapping(simpleShape, orientableShape)),
	twoDifferent(rowOf(orientableShape)),
	and(rowOf(orientableShape), simpleShape),
	and(rowOf(orientableShape), rowOf(simpleShape)),
	and(rowOf(orientableShape), orientableShape),
	and(rowOf(orientableShape), containing(simpleShape, orientableShape)),
	and(rowOf(orientableShape), overlapping(simpleShape, orientableShape)),
];

function generateDescription(budget, rand) {
	return "A " + rand(patterns) + " background; " + rand(optionsMatchingBudget(budget, options)).generate(budget, rand);
}

// Tests
function testAll() {
    testFakeRandFirstFromPatterns_shouldBeSmooth();
    testFakeRandFifthFromPatterns_shouldBeWavy();
    testFakeRand_shouldGoThroughIndices();
    testSimpleShape_example();
    testTwoSimpleShapes_example();
    testSimpleShapeAndOrientableShape_example();
    testRowOfSimpleShapes_example();
    testOrientableShape_example();
}

// The `budget` tracking is not testet, but it's not used...
// The `cost` calculations are not tested but they're pretty simple.

function testFakeRandFirstFromPatterns_shouldBeSmooth() {
    got = makeFakeRand([0])(patterns);
    want = "smooth";
    if (got !== want) {
        console.log("testFakeRandFirstFromPatterns_shouldBeSmooth: got " + got + ", want " + want);
    }
}

function testFakeRandFifthFromPatterns_shouldBeWavy() {
    got = makeFakeRand([5])(patterns);
    want = "wavy";
    if (got !== want) {
        console.log("testFakeRandFifthFromPatterns_shouldBeWavy: got " + got + ", want " + want);
    }
}

function testFakeRand_shouldGoThroughIndices() {
    rand = makeFakeRand([0,1]);
    ignored = rand(patterns);
    got = rand(patterns);
    want = "speckled";
    if (got !== want) {
        console.log("testFakeRand_shouldGoThroughIndices: got " + got + ", want " + want);
    }
}

function testSimpleShape_example() {
    rand = makeFakeRand([2,5]);
    got = simpleShape.generate(10, rand);
    want = "a pinstripe hexagon";
    if (got !== want) {
        console.log("testSimpleShape_example: got " + got + ", want " + want);
    }
}

function testTwoSimpleShapes_example() {
    rand = makeFakeRand([2,5,0,0,1]);
    got = twoDifferent(simpleShape).generate(10, rand);
    want = "a pinstripe hexagon above a smooth circle";
    if (got !== want) {
        console.log("testTwoSimpleShapes_example: got " + got + ", want " + want);
    }
}

function testSimpleShapeAndOrientableShape_example() {
    rand = makeFakeRand([2,5,0,0,1,0]);
    got = and(simpleShape, orientableShape).generate(10, rand);
    want = "a pinstripe hexagon above a smooth semicircle facing upward";
    if (got !== want) {
        console.log("testSimpleShapeAndOrientableShape_example: got " + got + ", want " + want);
    }
}

function testRowOfSimpleShapes_example() {
    rand = makeFakeRand([2,0,0,1]);
    got = rowOf(simpleShape).generate(10, rand);
    want = "four of a smooth square in a horizontal row";
    if (got !== want) {
        console.log("testRowOfSimpleShapes_example: got " + got + ", want " + want);
    }
}

function testOrientableShape_example() {
    rand = makeFakeRand([1,2,3]);
    got = orientableShape.generate(10, rand);
    want = "a speckled arrow facing to the right";
    if (got !== want) {
        console.log("testOrientableShape_example: got " + got + ", want " + want);
    }
}

function fuzz() {
    for (budget = 1; budget <= 4; budget++) {
        for (i = 0; i < 100; i++) {
            generateDescription(budget, uniformFromList);
        }
    }
}
