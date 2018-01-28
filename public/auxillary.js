function point_dist(P, Q){
    let [dx, dy] = [P.x - Q.x, P.y - Q.y];
    return (dx ** 2 + dy ** 2) ** .5;
}
// point_dist({x: 0, y: 0}, {x: 3, y: 4.1})


