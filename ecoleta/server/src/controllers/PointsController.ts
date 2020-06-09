import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItem = String(items)
      .split(',')
      .map(item => Number(item.trim()));

      const points = await knex('points')
       .join('point_items', 'points.id', '=', 'point_items.point_id')
       .whereIn('point_items.item_id', parsedItem)
       .where('city', String(city))
       .where('uf', String(uf))
       .distinct()
       .select('points.*');

    return response.json(points)
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point) {
      return response.status(400).json({ message: 'Point no found' })
    }

    const items = await knex('items')
     .join('point_items', 'items.id', '=', 'point_items.item_id')
     .where('point_items.point_id', id)
     .select('items.title');

    return response.json({ point, items });
  }
  
  async create(request: Request, response: Response)  {
    const {
      name, 
      email, 
      whatsapp, 
      latitute, 
      longitude, 
      city, 
      uf,
      items
    } = request.body;
  
    const trx = await knex.transaction()

    const point = {
      image: 'https://s2.glbimg.com/b7zxEWDh3ebRmzRJrnakTvkM_KI=/620x350/e.glbimg.com/og/ed/f/original/2017/09/11/thinkstockphotos-492546162.jpg',
      name, 
      email, 
      whatsapp, 
      latitute, 
      longitude, 
      city, 
      uf
    }
  
    const insertedIds = await trx('points').insert(point)
  
    const point_id = insertedIds[0];
  
    const pointsItems = items.map((item_id: number )=>{
      return {
        item_id,
        point_id,
      }
    })
  
    await trx('point_items').insert(pointsItems);

    await trx.commit();
  
    return response.json({
      id: point_id,
      ...point,
    })
  }

  }


export default PointsController;