import { Request, Response, NextFunction } from 'express';
export declare const dealsController: {
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getKanban(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStage(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=deals.controller.d.ts.map