function TableExport(element) {

    var table = {
        rows: [],
        meta: []
    };

    if (element instanceof HTMLTableElement) {
        // 테이블 생성
        for (var i = 0, tr, trs = element.children, ilen = trs.length; tr = trs[i], i < ilen; i++) {
            // `tr`
            if (tr instanceof HTMLTableRowElement && tr.childElementCount > 0) {

                for (var k = 0, cSize = 0, cell, cells = tr.children, klen = cells.length; cell = cells[k], k < klen; k++) {

                    if (k === 0) {
                        // 테이블의 컬럼 갯수를 센다.
                        for (var j = 0, colspan; j < klen; j++) {

                            if (colspan = Number(cell.getAttribute('colspan')) > 0) {
                                cSize += colspan;
                            } else {
                                cSize++
                            }
                        }
                    }
                    // `th`, `td`
                    if (cell instanceof HTMLTableCellElement) {

                        // 셀에 데이터가 존재하지 않는 경우 데이터를 입력한다. -- `colspan`, `rowspan`으로 인해 값이 미리 입력되는 경우를 제외한 모든 경우.
                        var ctext = cell.innerText;

                        if (!table.rows[i]) {
                            // `Row`가 존재하지 않을경우 생성
                            table.rows[i] = [];
                            table.meta[i] = [];
                        }

                        table.rows[i].push(ctext);
                        // DOM 객체에 접근하지 않기 위해 미리 데이터를 생성함.
                        table.meta[i].push({
                            colspan: Number(cell.colSpan),
                            rowspan: Number(cell.rowSpan)
                        });
                    }
                }
            }
        }
        // `colspan`, `rowspan` 데이터를 이용하여 빈 공간을 채움.
        for (var i = 0; i < table.meta.length; i++) {

            for (var k = 0; k < table.meta[i].length; k++) {

                var span = table.meta[i][k];

                if (span.colspan > 1) {
                    // `colspan` 개수만큼 셀에 데이터를 복사한다.
                    var tail = table.rows[i].splice(k + 1);

                    for (var j = 1; j < span.colspan; j++) {

                        table.rows[i].push(table.rows[i][k]);
                    }

                    table.rows[i].push.apply(table.rows[i], tail);
                }

                if (span.rowspan > 1) {
                    // `rowspan` 개수만큼 셀에 데이터를 복사한다.
                    for (var tail, j = 1; j < span.rowspan; j++) {

                        tail = table.rows[i + j].splice(k);

                        table.rows[i + j].push(table.rows[i][k]);

                        table.rows[i + j].push.apply(table.rows[i + j], tail);
                    }
                }
            }
        }

    } else {

        throw "인자 값으로 입력되는 엘리먼트는 테이블 엘리먼트이어야만 합니다 :("
    }

    return table;
}
