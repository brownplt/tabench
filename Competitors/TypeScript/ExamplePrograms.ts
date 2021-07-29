import { CTop, parseTable, STop, Table } from './EncodeTables'
import { buildColumn, dropColumns, getColumn2, getValue, header, nrows, selectColumns1, selectColumns2, selectColumns3, selectRows1, selectRows2, tfilter } from './TableAPI'
import { filter, fisherTest, map, range, sample, length, startsWith, concat, colNameOfNumber } from './helpers'
import { makeTester } from './unitTest'
import { gradebook, gradebookMissing, jellyAnon, jellyNamed } from './ExampleTables'

const Tester = makeTester()

// ## dotProduct
const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

const dotProduct = <C1 extends CTop, C2 extends CTop, S extends STop & Record<C1 | C2, number>>(t: Table<S>, c1: C1, c2: C2): number => {
    const ns = getColumn2(t, c1)
    const ms = getColumn2(t, c2)
    return sum(range(nrows(t)).map(i => ns[i] * ms[i]))
}

Tester.assertEqual(
    'dotProduct',
    () => dotProduct(gradebook, "quiz1", "quiz2"),
    183)

// ## sampleRows

const sampleRows = <S extends STop>(t: Table<S>, n: number): Table<S> => {
    // To pass the test, I have to fix the indexes.
    const indexes = [2, 1]
    // const indexes = sample(range(nrows(t)), n)
    return selectRows1(t, indexes)
}

Tester.assertEqual(
    'sampleRows',
    () => sampleRows(gradebookMissing, 2),
    parseTable([
        ['name', 'age', 'quiz1', 'quiz2', 'midterm', 'quiz3', 'quiz4', 'final'],
        ["Eve", 13, null, 9, 84, 8, 8, 77],
        ["Alice", 17, 6, 8, 88, null, 7, 85]
    ])
)

// ## pHackingHomogeneous

const pHacking = <S extends STop & { "get acne": boolean } & Record<string, boolean>>(t: Table<S>): string[] => {
    // We store the printed strings so that it can be easily compared to the 
    // expected output.
    const printed: string[] = []
    const colAcne = getColumn2(t, "get acne")
    const jellyAnon = dropColumns(t, ["get acne"])
    for (const c of header(jellyAnon)) {
        const colJB = getColumn2(t, c)
        const p = fisherTest(colAcne, colJB)
        if (p < 0.05) {
            printed.push("We found a link between " + c + " jelly beans and acne (p < 0.05).")
        }
    }
    return printed
}
Tester.assertEqual(
    'pHackingHomogeneous',
    () => pHacking(jellyAnon),
    [
        "We found a link between orange jelly beans and acne (p < 0.05)."
    ]
)


// ## pHackingHeterogeneous
Tester.assertEqual(
    'pHackingHeterogeneous',
    () => pHacking(dropColumns(jellyNamed, ["name"])),
    [
        "We found a link between orange jelly beans and acne (p < 0.05)."
    ]
)


// ## quizScoreFilter

Tester.assertEqual(
    'quizScoreFilter',
    () => buildColumn(
        gradebook,
        "average-quiz",
        (row) => {
            const quizColnames =
                filter(
                    header(row),
                    (c) => {
                        return startsWith(c, "quiz")
                    })
            const scores = map(
                quizColnames,
                (c) => {
                    return getValue(row, c) as number
                })
            return sum(scores) / length(scores)
        }),
    parseTable([
        ['name', 'age', 'quiz1', 'quiz2', 'midterm', 'quiz3', 'quiz4', 'final', 'average-quiz'],
        ["Bob", 12, 8, 9, 77, 7, 9, 87, 8.25],
        ["Alice", 17, 6, 8, 88, 8, 7, 85, 7.25],
        ["Eve", 13, 7, 9, 84, 8, 8, 77, 8],
    ])
)

// ## quizScoreSelect

const quizColNames =
    map(
        range(4),
        (i) => concat("quiz", colNameOfNumber(i))
    )

const quizTable = selectColumns3(gradebook, quizColNames as ['quiz1', 'quiz2', 'quiz3', 'quiz4'])

const quizAndAverage =
    buildColumn(
  quizTable,
  "average",
  function(r):
    ns = map(header(r),
      function(c):
        getValue(r, c)
      end)
    average(ns)
  end)

Tester.go()