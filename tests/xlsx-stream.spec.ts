import { getXlsxStream, getXlsxStreams, getWorksheets } from '../src';
import {setTimeout} from 'timers/promises'

async function iterableToArray(iterable: AsyncIterable<unknown>): Promise<unknown[]> {
    const data = [];

    for await (const x of iterable) {
        data.push(x);
    }

    return data;
}

it('reads XLSX file correctly', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/basic.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads empty XLSX file correctly', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/empty.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads XLSX file with header', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/with-header.xlsx',
        sheet: 0,
        withHeader: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads XLSX file with header values being dupicated', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/with-header-duplicated.xlsx',
        sheet: 0,
        withHeader: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('ignores empty rows', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/empty-rows.xlsx',
        sheet: 0,
        ignoreEmpty: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('does not ignore empty rows with data when ignoreEmpty is false', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/empty-rows.xlsx',
        sheet: 0,
        ignoreEmpty: false,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('adds empty rows not containing data when ignoreEmpty is false', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/empty-rows-missing.xlsx',
        sheet: 0,
        ignoreEmpty: false
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('gets worksheets', async () => {
    const sheets = await getWorksheets({
        filePath: './tests/assets/worksheets.xlsx',
    });

    expect(sheets).toEqual([
        { name: 'Sheet1', hidden: false, },
        { name: 'Sheet2', hidden: false, },
        { name: 'Sheet3', hidden: false, },
        { name: 'Sheet4', hidden: false, },
    ]);
});

it('gets worksheets with correct hidden info', async () => {
    const sheets = await getWorksheets({
        filePath: './tests/assets/hidden-sheet.xlsx',
    });
    expect(sheets).toEqual([
        { name: 'Sheet1', hidden: false, },
        { name: 'Sheet2', hidden: true, },
        { name: 'Sheet3', hidden: false, },
    ]);
});

it('get worksheets should fail gracefully for a corrupted xlsx', async () => {
    await expect(getWorksheets({
        filePath: './tests/assets/corrupted-file.xlsx',
    })).rejects.toThrow('Bad archive');
});

it('gets worksheet by name, even if they are reordered', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/worksheets-reordered.xlsx',
        sheet: 'Sheet1',
        ignoreEmpty: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();

});

it('gets worksheet by index, even if they are reordered', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/worksheets-reordered.xlsx',
        sheet: 1,
        ignoreEmpty: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it(`doesn't fail when empty row has custom height`, async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/empty-row-custom-height.xlsx',
        sheet: 0,
        ignoreEmpty: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it(`throws expected bad archive error`, async () => {
    await expect(getXlsxStream({
        filePath: './tests/assets/bad-archive.xlsx',
        sheet: 0,
    })).rejects.toMatchSnapshot();
});

it(`reads 2 sheets from XLSX file using generator`, async () => {
    const generator = getXlsxStreams({
        filePath: './tests/assets/worksheets-reordered.xlsx',
        sheets: [
            {
                id: 2,
                ignoreEmpty: true
            },
            {
                id: 'Sheet1',
                ignoreEmpty: true
            }
        ]
    });

    const data: unknown[] = [];

    for await (const stream of generator) {
        const streamData = await iterableToArray(stream);

        data.push(...streamData);
    }

    expect(data).toMatchSnapshot();
});

it('fills merged cells with data', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/merged-cells.xlsx',
        sheet: 0,
        fillMergedCells: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('fills merged cells with data if header has merged cells', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/merged-cells-with-header.xlsx',
        sheet: 0,
        fillMergedCells: true,
        withHeader: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('correctly handles shared string if it has just one value in cell', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/shared-string-single-value.xlsx',
        sheet: 0,
        ignoreEmpty: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads XLSX file with header located in specific row', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/with-header-number.xlsx',
        sheet: 0,
        withHeader: 5,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads number values with leading zeroes correctly', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/zeroes.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('correctly reads file created with OpenXML (with `x` namespaces)', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/open-xml.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it(`applies custom number format`, async () => {
    const generator = getXlsxStreams({
        filePath: './tests/assets/custom-number-format.xlsx',
        sheets: [
            {
                id: 0,
            },
            {
                id: 1,
                numberFormat: 'excel',
            },
            {
                id: 2,
                numberFormat: {
                    47: 'mm ss'
                },
            }
        ]
    });

    const data: unknown[] = [];

    for await (const stream of generator) {
        const streamData = await iterableToArray(stream);

        data.push(...streamData);
    }

    expect(data).toMatchSnapshot();
});

it('reads XLSX file with header values being undefined', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/multiple-undefined-columns-as-header.xlsx',
        sheet: 0,
        withHeader: true,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads XLSX file correctly with correct encoding', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/encoded.xlsx',
        sheet: 0,
        encoding: 'utf8'
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads XLSX file incorrectly without encoding set', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/encoded.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('correctly handles custom format', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/custom-format.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('reads XLSX file with styles.xml tags prefixed with `x:` correctly', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/prefixed-styles-xml-tags.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});

it('correctly formats Hh hours in date', async () => {
    const stream = await getXlsxStream({
        filePath: './tests/assets/incorrect-hours-format.xlsx',
        sheet: 0,
    });

    const data = await iterableToArray(stream);

    expect(data).toMatchSnapshot();
});